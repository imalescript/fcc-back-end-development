import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import watchlistRoutes from "./routes/watchlist.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

export const app = express();

app.use(helmet());
app.use(express.json({ limit: config.jsonLimit }));

app.get("/", (req, res) => {
  res.send("Family Movie Watchlist API");
});

app.use("/api/auth", authRoutes);
app.use("/api/watchlist", watchlistRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
