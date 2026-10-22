import express from "express";
import { config } from "../config.js";
import { AuthService } from "../services/auth-service.js";

const router = express.Router();
const authService = new AuthService(config);

const hasCredentials = (username, password) =>
  typeof username === "string" &&
  typeof password === "string" &&
  username.trim().length > 0 &&
  password.length > 0;

router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (!hasCredentials(username, password)) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  const token = await authService.login(username, password);

  if (!token) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  return res.status(200).json({ token });
});

export default router;
