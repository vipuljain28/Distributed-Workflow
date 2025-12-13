import { prisma } from "../../db/client";
import { hashPassword, comparePassword } from "../../utils/hash";
import { generateTokens } from "../../utils/jwt";
import { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(409).json({ message: "User exists" });

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role }
    });

    return res.json({ message: "Registered", user });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "Not found" });

  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid password" });

  const tokens = generateTokens({ id: user.id, role: user.role });

  return res.json({
    message: "Logged in",
    user: { id: user.id, email: user.email, role: user.role },
    ...tokens
  });
};
