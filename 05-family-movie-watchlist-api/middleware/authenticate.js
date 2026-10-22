import jwt from "jsonwebtoken";
import { config } from "../config.js";

const BEARER_PATTERN = /^Bearer\s+(.+)$/i;
const JWT_ALGORITHMS = ["HS256", "HS384", "HS512"];

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function authenticate(req, res, next) {
  const match = BEARER_PATTERN.exec(req.headers?.authorization ?? "");

  if (!match) {
    return res.status(401).json({ error: "No token provided." });
  }

  try {
    req.user = jwt.verify(match[1].trim(), config.jwtSecret, {
      algorithms: JWT_ALGORITHMS,
    });

    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
