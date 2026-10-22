import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findByUsername } from "../utils/db.js";

export class AuthService {
  constructor({ jwtSecret, tokenTtl = "1h" }) {
    this.jwtSecret = jwtSecret;
    this.tokenTtl = tokenTtl;
  }

  async login(username, password) {
    if (typeof username !== "string" || typeof password !== "string") {
      return null;
    }

    const user = findByUsername(username.trim());
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      this.jwtSecret,
      { expiresIn: this.tokenTtl }
    );
  }
}
