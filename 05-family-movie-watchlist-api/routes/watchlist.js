import express from "express";
import { getWatchlist, addMovie, updateMovie, deleteMovie } from "../utils/db.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeModification } from "../middleware/authorize.js";
import { movieInput, parseId } from "../utils/movie-input.js";

const router = express.Router();
router.use(authenticate);

const sendNotFound = (res, message) => {
  return res.status(404).json({ error: message });
};

const sendInvalidId = (res) => {
  return res.status(400).json({ error: "Invalid id." });
};

router.get("/:userId", (req, res) => {
  const userId = parseId(req.params.userId);
  if (userId === null) return sendInvalidId(res);

  const list = getWatchlist(userId);
  if (list === null) return sendNotFound(res, "User not found.");

  return res.status(200).json(list);
});

router.post("/:userId/movies", authorizeModification, (req, res) => {
  const userId = parseId(req.params.userId);
  if (userId === null) return sendInvalidId(res);

  const movie = addMovie(userId, movieInput.create(req.body));
  if (!movie) return sendNotFound(res, "User not found.");

  return res.status(201).json(movie);
});

router.put("/:userId/movies/:movieId", authorizeModification, (req, res) => {
  const userId = parseId(req.params.userId);
  const movieId = parseId(req.params.movieId);
  if (userId === null || movieId === null) return sendInvalidId(res);

  const updatedMovie = updateMovie(userId, movieId, movieInput.update(req.body));
  if (!updatedMovie) return sendNotFound(res, "Movie or user not found.");

  return res.status(200).json(updatedMovie);
});

router.delete("/:userId/movies/:movieId", authorizeModification, (req, res) => {
  const userId = parseId(req.params.userId);
  const movieId = parseId(req.params.movieId);
  if (userId === null || movieId === null) return sendInvalidId(res);

  const success = deleteMovie(userId, movieId);
  if (!success) return sendNotFound(res, "Movie or user not found.");

  return res.status(200).json({ message: "Movie removed successfully." });
});

export default router;
