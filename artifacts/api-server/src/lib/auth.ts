import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env["SESSION_SECRET"];

if (!SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const SECRET_STR: string = SECRET;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface SessionPayload {
  userId: string;
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, SECRET_STR, { expiresIn: "365d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET_STR);
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      typeof (decoded as { userId: unknown }).userId === "string"
    ) {
      return { userId: (decoded as { userId: string }).userId };
    }
    return null;
  } catch {
    return null;
  }
}
