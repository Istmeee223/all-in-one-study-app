import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { users } from "../shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function registerUser(email: string, username: string, password: string) {
  const existing = await storage.getUserByEmail(email);
  if (existing) throw new Error("Email already registered");
  const passwordHash = await bcrypt.hash(password, 10);
  return storage.createUser({ email, username, passwordHash });
}

export async function loginUser(email: string, password: string) {
  const user = await storage.getUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  return { user, token };
}

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token" });
  try {
    const payload = jwt.verify(auth.split(" ")[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}