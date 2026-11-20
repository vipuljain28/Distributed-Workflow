import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];

  // Direct Master Admin Password check
  const masterPassword = process.env.ADMIN_PASSWORD;
  if (masterPassword && token === masterPassword) {
    (req as any).user = { id: "admin-master", email: "admin@workflow.local", role: "ADMIN" };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET!);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const hasRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    console.log(`user role: ${user.role} in ${roles}`);
    if (!roles.includes(user.role.trim())) {

      return res.status(403).json({ message: "Not allowed" });
    }

    next();
  };
};
