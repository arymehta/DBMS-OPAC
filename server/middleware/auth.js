import jwt from "jsonwebtoken";
import sql from "../db/dbconn.js";

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Access Denied: No Token Provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied: Token Missing" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid Token" });
    if (!decoded.user) return res.status(400).json({ message: "Malformed Token" });
    req.user = decoded.user;
    next();
  });
};

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const [user] = await sql`SELECT role FROM USERS WHERE uid = ${req.user.uid}`;
    if (!user || user.role !== "ADMIN") return res.status(403).json({ message: "Access Denied: Admins Only" });
    next();
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const requirePermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const [result] = await sql`SELECT permissions FROM ADMIN_DETAILS WHERE uid = ${req.user.uid}`;
      if (!result) return res.status(403).json({ message: "Access Denied: Not an Admin" });
      const permissions = result.permissions || {};
      const missing = requiredPermissions.filter((perm) => !permissions[perm]);
      if (missing.length > 0)
        return res.status(403).json({ message: `Permission Denied: Missing [${missing.join(", ")}]` });
      next();
    } catch {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
};

export { authenticateUser, requireAdmin, requirePermission };
