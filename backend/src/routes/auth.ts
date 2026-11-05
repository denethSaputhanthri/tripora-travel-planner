import { Router , Request , Response ,NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import jwt from "jsonwebtoken";

const router = Router();

const COOKIE_NAME = process.env.COOKIE_NAME || "tripora_token";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

function setAuthCookie(res: Response, userId: string) {
    const token = jwt.sign({sub: userId }, process.env.JWT_SECRET as string, { 
        expiresIn: "7D" ,
        });
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
    });
}

// POST /api/v1/auth/register
router.post("/register", async (req : Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten().fieldErrors });
  }
  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({name, email, passwordHash});
    setAuthCookie(res, user.id);
    res.status(201).json({ message: "User created successfully", user });
    
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Could not create account" });
    }
    throw err;
  }
});

// POST /api/v1/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten().fieldErrors });
  }
  const { email, password } = parsed.data;

  try {
    const user = await User.findOne({ email }).select("+passwordHash");
    const isMatch = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!isMatch || !user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    setAuthCookie(res, user.id);
    return res.json({user : { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/v1/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: "Logged out successfully" });
});

// GET /api/v1/auth/me
router.get("/me", async (req: Request, res: Response, _next: NextFunction) => {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: "Not logged in" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { sub: string };
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: "Not logged in" });
    return res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    return res.status(401).json({ message: "Not logged in" });
  }
});


export default router;