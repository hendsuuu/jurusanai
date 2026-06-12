import bcrypt from "bcryptjs";

export function hashPassword(password: string, rounds = 12) {
  return bcrypt.hash(password, rounds);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
