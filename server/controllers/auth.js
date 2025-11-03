import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../db/dbconn.js';
import sendMail from '../utils/sendMail.js';

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (userDetails) => jwt.sign({ user: userDetails }, JWT_SECRET, { expiresIn: '7d' });

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const addMinutesUTC = (date, minutes) => new Date(date.getTime() + minutes * 60000);
const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);

const adminSignup = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		const authHeader = req.headers['authorization'] || '';
		const token = authHeader.replace('Bearer ', '').trim();

		if (token !== process.env.SUPER_ADMIN_TOKEN) {
			return res.status(403).json({ message: 'Unauthorized to create admin users' });
		}

		const [existingUser] = await sql`SELECT * FROM USERS WHERE email = ${email}`;
		if (existingUser) {
			if (existingUser.is_verified) {
				return res.status(400).json({ message: 'User already exists. Please login.' });
			} else {
				await sql`DELETE FROM OTP WHERE uid = ${existingUser.uid}`;
				await sql`DELETE FROM USERS WHERE uid = ${existingUser.uid}`;
			}
		}

		const passwordHash = await bcrypt.hash(password, 10);

		/*
		 * I am directly inserting isVerified as true since the request
		 * header already has super admin token for authentication.
		 * Not sure if this is the best approach to implement this.
		 */
		const [user] = await sql`
			INSERT INTO USERS (name, email, password_hash, is_verified, role)
			VALUES (${name}, ${email}, ${passwordHash}, true, 'ADMIN') RETURNING uid, email, name, role;
		`;

		const adminDetails = await sql`
			INSERT INTO ADMIN_DETAILS (uid)
			VALUES (${user.uid})
			RETURNING uid;
		`;

		const userDetails = await sql`
			SELECT uid, name, email, role FROM USERS WHERE uid = ${user.uid};
		`;

		const tokenForUser = generateToken(userDetails[0]);
	
		res.status(201).json({
			message: 'Admin user created successfully.',
			user: userDetails[0],
			token: tokenForUser
		});
	} catch (e) {
		console.error(e);
		res.status(500).json({ message: 'Admin signup failed', error: e.message });
	}
}

const signup = async (req, res) => {
	try {
		const { name, email, password, role } = req.body;
		let userRole = 'ISSUER';

		if (role === 'ADMIN') {
			const authHeader = req.headers['authorization'] || '';
			const token = authHeader.replace('Bearer ', '').trim();

			if (token !== process.env.SUPER_ADMIN_TOKEN) {
				return res.status(403).json({ message: 'Unauthorized to create admin users' });
			}
			userRole = 'ADMIN';
		}

		const [existingUser] = await sql`SELECT * FROM USERS WHERE email = ${email}`;
		if (existingUser) {
			if (existingUser.is_verified) {
				return res.status(400).json({ message: 'User already exists. Please login.' });
			} else {
				await sql`DELETE FROM OTP WHERE uid = ${existingUser.uid}`;
				await sql`DELETE FROM USERS WHERE uid = ${existingUser.uid}`;
			}
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const [user] = await sql`
			INSERT INTO USERS (name, email, password_hash, is_verified, role)
			VALUES (${name}, ${email}, ${passwordHash}, false, ${userRole})
			RETURNING uid, email, name, role;
    	`;

		const otp = generateOtp();
		const otpHash = await bcrypt.hash(otp, 10);
		const expiresAt = addMinutes(new Date(), 10); // 10 minutes from now

		await sql`
			INSERT INTO OTP (uid, otp_hash, purpose, expires_at)
			VALUES (${user.uid}, ${otpHash}, 'SIGNUP', ${expiresAt.toISOString()});
		`;

		sendMail(user.email, 'Verify your email', 'otpTemplate', { userName: user.name, otp });
		res.status(201).json({ message: 'User created. Please verify OTP sent to your email.' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Signup failed', error: err.message });
	}
};


const verifyOtp = async (req, res) => {
	try {
		const { email, otp, purpose } = req.body;

		const [user] = await sql`SELECT uid, is_verified, role FROM USERS WHERE email = ${email}`;
		if (!user) return res.status(404).json({ message: 'User not found' });
		if (user.is_verified) return res.status(400).json({ message: 'User already verified. Please login.' });

		const [otpRecord] = await sql`
			SELECT * FROM OTP
			WHERE uid = ${user.uid} AND purpose = ${purpose}
			ORDER BY created_at DESC LIMIT 1;
		`;
		if (!otpRecord) return res.status(400).json({ message: 'No OTP found' });

		const now = new Date();
		const expiresAt = new Date(otpRecord.expires_at);

		if (otpRecord.verified) return res.status(400).json({ message: 'OTP already used' });

		console.log("Now:", now.toLocaleString(), "Expires At:", expiresAt.toLocaleString());

		if (expiresAt < now) return res.status(400).json({ message: 'OTP expired' });

		const isValid = await bcrypt.compare(otp, otpRecord.otp_hash);
		if (!isValid) return res.status(400).json({ message: 'Invalid OTP' });

		await sql`UPDATE USERS SET is_verified = true WHERE uid = ${user.uid}`;
		await sql`DELETE FROM OTP WHERE otp_id = ${otpRecord.otp_id}`;

		if (user.role === 'ISSUER') {
			await sql`
				INSERT INTO ISSUER_DETAILS (uid)
				VALUES (${user.uid})
				ON CONFLICT (uid) DO NOTHING;
      		`;
		} else if (user.role === 'ADMIN') {
			await sql`
				INSERT INTO ADMIN_DETAILS (uid)
				VALUES (${user.uid})
				ON CONFLICT (uid) DO NOTHING;
      		`;
		}

		const _user = await sql`SELECT uid, name, email, role FROM USERS WHERE uid = ${user.uid}`;
		const token = generateToken(_user[0]);

		res.json({ message: 'OTP verified successfully, your account is now active.', user: _user, token });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Verification failed' });
	}
};

const resendOtp = async (req, res) => {
	try {
		const { email, purpose } = req.body;

		const [user] = await sql`SELECT uid, name, is_verified FROM USERS WHERE email = ${email}`;
		if (!user) return res.status(404).json({ message: 'User not found' });
		if (user.is_verified && purpose === 'SIGNUP')
			return res.status(400).json({ message: 'User already verified. Please login.' });

		await sql`DELETE FROM OTP WHERE uid = ${user.uid} AND purpose = ${purpose}`;

		const otp = generateOtp();
		const otpHash = await bcrypt.hash(otp, 10);
		const expiresAt = addMinutes(new Date(), 10);

		await sql`
			INSERT INTO OTP (uid, otp_hash, purpose, expires_at)
			VALUES (${user.uid}, ${otpHash}, ${purpose}, ${expiresAt.toISOString()});
    	`;

		sendMail(email, 'Your OTP Code', 'otpTemplate', { userName: user.name, otp });
		res.json({ message: 'OTP resent successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: 'Resending OTP failed',
			error: err.message
		});
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const [user] = await sql`SELECT * FROM USERS WHERE email = ${email}`;
		if (!user) return res.status(400).json({ message: 'Invalid credentials' });

		const isMatch = await bcrypt.compare(password, user.password_hash);
		if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

		if (!user.is_verified) {
			return res.status(403).json({ message: 'User not verified. Please register again!' });
		}

		const userDetails = await sql`
			SELECT uid, name, email, role FROM USERS WHERE uid = ${user.uid};
		`;

		if (!userDetails.length) {
			throw new Error("User not found");
		}

		const token = generateToken(userDetails[0]);
		res.json({ token, user: { uid: user.uid, name: user.name, email: user.email, role: user.role } });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Login failed' });
	}
};

const requestResetPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const [user] = await sql`SELECT uid, name FROM USERS WHERE email = ${email}`;
		if (!user) return res.status(404).json({ message: 'User not found' });

		const otp = generateOtp();
		const otpHash = await bcrypt.hash(otp, 10);
		const expiresAt = addMinutes(new Date(), 5);

		await sql`
			INSERT INTO OTP (uid, otp_hash, purpose, expires_at)
			VALUES (${user.uid}, ${otpHash}, 'RESET_PASSWORD', ${expiresAt});
    	`;

		sendMail(user.email, 'Password Reset OTP', 'passwordResetTemplate', { userName: user.name, otp });
		res.json({ message: 'OTP sent to your email for password reset.' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Error sending reset OTP' });
	}
};

const confirmResetPassword = async (req, res) => {
	try {
		const { email, otp, newPassword } = req.body;
		const [user] = await sql`SELECT uid FROM USERS WHERE email = ${email}`;
		if (!user) return res.status(404).json({ message: 'User not found' });

		const [otpRecord] = await sql`
			SELECT * FROM OTP
			WHERE uid = ${user.uid} AND purpose = 'RESET_PASSWORD'
			ORDER BY created_at DESC LIMIT 1;
    	`;
		if (!otpRecord) return res.status(400).json({ message: 'No OTP found' });
		if (otpRecord.verified) return res.status(400).json({ message: 'OTP already used' });
		if (new Date(otpRecord.expires_at) < new Date()) return res.status(400).json({ message: 'OTP expired' });

		const valid = await bcrypt.compare(otp, otpRecord.otp_hash);
		if (!valid) return res.status(400).json({ message: 'Invalid OTP' });

		const newHash = await bcrypt.hash(newPassword, 10);
		await sql`UPDATE USERS SET password_hash = ${newHash} WHERE uid = ${user.uid}`;
		await sql`DELETE FROM OTP WHERE otp_id = ${otpRecord.otp_id}`;

		res.json({ message: 'Password reset successful' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Password reset failed' });
	}
};


const checkAuth = async (req, res) => {
	try {
		const authHeader = req.headers['authorization'] || '';
		const token = authHeader.replace('Bearer ', '').trim();

		if (!token) {
			return res.status(401).json({ message: 'No token provided' });
		}

		const decoded = jwt.verify(token, JWT_SECRET);

		const [user] = await sql`SELECT uid, name, email, role, is_verified FROM USERS WHERE uid = ${decoded.uid}`;

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		if (!user.is_verified) {
			return res.status(403).json({ message: 'User not verified' });
		}

		res.json({
			message: 'Token is valid',
			data: {
				uid: user.uid,
				name: user.name,
				email: user.email,
				role: user.role
			}
		});
	} catch (err) {
		if (err.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Token expired' });
		}
		if (err.name === 'JsonWebTokenError') {
			return res.status(401).json({ message: 'Invalid token' });
		}
		console.error(err);
		res.status(500).json({ message: 'Authentication check failed' });
	}
};


export {
	signup,
	verifyOtp,
	resendOtp,
	checkAuth,
	login,
	requestResetPassword,
	confirmResetPassword,
	adminSignup
};
