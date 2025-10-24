import nodeMailer from 'nodemailer';
import dotenv from 'dotenv';
import mailTemplates from './mailTemplates.js';

dotenv.config();

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendMail = (to, subject, template, data) => {
    console.log(template);
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: mailTemplates[template](data)
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    });
}

export default sendMail;