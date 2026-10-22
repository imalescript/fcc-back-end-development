const DEFAULT_SECRET = "your_jwt_secret";
const port = Number(process.env.PORT);

export const config = Object.freeze({
  port: Number.isInteger(port) && port > 0 && port <= 65535 ? port : 3000,
  jwtSecret: process.env.JWT_SECRET || DEFAULT_SECRET,
  tokenTtl: process.env.TOKEN_TTL || "1h",
  jsonLimit: "10kb",
});

if (!process.env.JWT_SECRET) {
  console.warn("[config] JWT_SECRET is not set; using the development fallback.");
}
