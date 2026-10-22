import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import request from "supertest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jwt from "jsonwebtoken";
import { app } from "../../app.js";
import { config } from "../../config.js";

const WATCHLISTS_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/watchlists.json"
);

let originalWatchlists;
let parentToken;
let childToken;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const login = (username, password) =>
  request(app).post("/api/auth/login").send({ username, password });

const addMovie = (
  token,
  userId,
  body = { title: "Test Movie", genre: "Action" }
) =>
  request(app)
    .post(`/api/watchlist/${userId}/movies`)
    .set(auth(token))
    .send(body);

beforeAll(async () => {
  originalWatchlists = fs.readFileSync(WATCHLISTS_PATH, "utf8");

  const parentLogin = await login("dad_miller", "parent456");
  const childLogin = await login("jake_miller", "child123");

  expect(parentLogin.status).toBe(200);
  expect(childLogin.status).toBe(200);

  parentToken = parentLogin.body.token;
  childToken = childLogin.body.token;
});

afterEach(() => {
  fs.writeFileSync(WATCHLISTS_PATH, originalWatchlists);
});

afterAll(() => {
  fs.writeFileSync(WATCHLISTS_PATH, originalWatchlists);
});

describe("GET /", () => {
  it("returns the API name", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toBe("Family Movie Watchlist API");
  });
});

describe("POST /api/auth/login", () => {
  it("returns 400 when both credentials are missing", async () => {
    const response = await request(app).post("/api/auth/login").send({});

    expect(response.status).toBe(400);
  });

  it("returns 400 when only the username is provided", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ username: "dad_miller" });

    expect(response.status).toBe(400);
  });

  it("returns 401 for an unknown username", async () => {
    const response = await login("nobody", "whatever");

    expect(response.status).toBe(401);
  });

  it("returns 401 for a wrong password", async () => {
    const response = await login("dad_miller", "wrong-password");

    expect(response.status).toBe(401);
  });

  it("returns 200 with a token for valid credentials", async () => {
    const response = await login("dad_miller", "parent456");

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe("string");

    const decoded = jwt.verify(response.body.token, config.jwtSecret);

    expect(decoded).toMatchObject({
      id: 1,
      username: "dad_miller",
      role: "parent",
    });
  });
});

describe("watchlist authentication", () => {
  it("returns 401 without an Authorization header", async () => {
    const response = await request(app).get("/api/watchlist/1");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "No token provided." });
  });

  it("returns 401 for a malformed token", async () => {
    const response = await request(app)
      .get("/api/watchlist/1")
      .set(auth("not-a-token"));

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid or expired token." });
  });

  it("returns 401 for an expired token", async () => {
    const expiredToken = jwt.sign(
      { id: 3, username: "jake_miller", role: "child" },
      config.jwtSecret,
      { expiresIn: -1 }
    );

    const response = await request(app)
      .get("/api/watchlist/3")
      .set(auth(expiredToken));

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid or expired token." });
  });
});

describe("GET /api/watchlist/:userId", () => {
  it("allows a parent to read any watchlist", async () => {
    const response = await request(app)
      .get("/api/watchlist/1")
      .set(auth(parentToken));

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("allows a child to read another user's watchlist", async () => {
    const response = await request(app)
      .get("/api/watchlist/1")
      .set(auth(childToken));

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("returns 404 for a missing user", async () => {
    const response = await request(app)
      .get("/api/watchlist/999999")
      .set(auth(parentToken));

    expect(response.status).toBe(404);
  });

  it("returns 400 for an invalid id", async () => {
    const response = await request(app)
      .get("/api/watchlist/abc")
      .set(auth(parentToken));

    expect(response.status).toBe(400);
  });
});

describe("POST /api/watchlist/:userId/movies", () => {
  it("allows a parent to add a movie to another user's watchlist", async () => {
    const response = await addMovie(parentToken, 3, {
      title: "Integration Parent Movie",
      genre: "Drama",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: "Integration Parent Movie",
      genre: "Drama",
      watched: false,
    });
    expect(typeof response.body.id).toBe("number");
  });

  it("forbids a child from adding a movie to another user's watchlist", async () => {
    const response = await addMovie(childToken, 1, {
      title: "Blocked Movie",
      genre: "Action",
    });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Access denied" });
  });

  it("allows a child to add a movie to their own watchlist", async () => {
    const response = await addMovie(childToken, 3, {
      title: "Child Own Movie",
      genre: "Action",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: "Child Own Movie",
      genre: "Action",
      watched: false,
    });
  });

  it("ignores extra fields and forces watched to false", async () => {
    const response = await addMovie(parentToken, 3, {
      title: "Sanitized Movie",
      genre: "Action",
      watched: true,
      hijack: "ignored",
    });

    expect(response.status).toBe(201);
    expect(response.body.watched).toBe(false);
    expect(response.body).not.toHaveProperty("hijack");
  });

  it("rejects a movie without a title", async () => {
    const response = await addMovie(parentToken, 3, { genre: "Action" });

    expect(response.status).toBe(400);
  });

  it("returns 400 for an invalid user id", async () => {
    const response = await addMovie(parentToken, "abc", {
      title: "Invalid Id",
      genre: "Action",
    });

    expect(response.status).toBe(400);
  });

  it("returns 404 when the target user does not exist", async () => {
    const response = await addMovie(parentToken, 999999, {
      title: "No User",
      genre: "Action",
    });

    expect(response.status).toBe(404);
  });
});

describe("PUT /api/watchlist/:userId/movies/:movieId", () => {
  it("allows a parent to update another user's movie", async () => {
    const created = await addMovie(parentToken, 3, {
      title: "Original Title",
      genre: "Drama",
    });

    const response = await request(app)
      .put(`/api/watchlist/3/movies/${created.body.id}`)
      .set(auth(parentToken))
      .send({ title: "Updated by Parent", watched: true });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: created.body.id,
      title: "Updated by Parent",
      genre: "Drama",
      watched: true,
    });
  });

  it("forbids a child from updating another user's movie", async () => {
    const created = await addMovie(parentToken, 1, {
      title: "Protected Movie",
      genre: "Action",
    });

    const response = await request(app)
      .put(`/api/watchlist/1/movies/${created.body.id}`)
      .set(auth(childToken))
      .send({ title: "Blocked Update" });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Access denied" });
  });

  it("allows a child to update their own movie", async () => {
    const created = await addMovie(childToken, 3, {
      title: "Child Original",
      genre: "Action",
    });

    const response = await request(app)
      .put(`/api/watchlist/3/movies/${created.body.id}`)
      .set(auth(childToken))
      .send({ watched: true });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: created.body.id,
      title: "Child Original",
      genre: "Action",
      watched: true,
    });
  });

  it("ignores unknown fields and keeps the movie id unchanged", async () => {
    const created = await addMovie(parentToken, 3, {
      title: "Original Title",
      genre: "Drama",
    });

    const response = await request(app)
      .put(`/api/watchlist/3/movies/${created.body.id}`)
      .set(auth(parentToken))
      .send({
        title: "Safe Update",
        genere: "typo",
        hijack: "ignored",
        id: 999999,
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(created.body.id);
    expect(response.body.title).toBe("Safe Update");
    expect(response.body).not.toHaveProperty("genere");
    expect(response.body).not.toHaveProperty("hijack");
  });

  it("rejects an invalid watched value", async () => {
    const created = await addMovie(parentToken, 3, {
      title: "Invalid Watched",
      genre: "Action",
    });

    const response = await request(app)
      .put(`/api/watchlist/3/movies/${created.body.id}`)
      .set(auth(parentToken))
      .send({ watched: "yes" });

    expect(response.status).toBe(400);
  });

  it("returns 404 for a missing movie", async () => {
    const response = await request(app)
      .put("/api/watchlist/3/movies/999999")
      .set(auth(parentToken))
      .send({ title: "Missing Movie" });

    expect(response.status).toBe(404);
  });

  it("returns 400 for an invalid movie id", async () => {
    const response = await request(app)
      .put("/api/watchlist/3/movies/abc")
      .set(auth(parentToken))
      .send({ title: "Invalid Id" });

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/watchlist/:userId/movies/:movieId", () => {
  it("allows a parent to delete another user's movie", async () => {
    const created = await addMovie(parentToken, 3, {
      title: "Delete Me",
      genre: "Action",
    });

    const response = await request(app)
      .delete(`/api/watchlist/3/movies/${created.body.id}`)
      .set(auth(parentToken));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Movie removed successfully." });

    const list = await request(app)
      .get("/api/watchlist/3")
      .set(auth(parentToken));

    expect(
      list.body.find((movie) => movie.id === created.body.id)
    ).toBeUndefined();
  });

  it("forbids a child from deleting another user's movie", async () => {
    const created = await addMovie(parentToken, 1, {
      title: "Protected Movie",
      genre: "Action",
    });

    const response = await request(app)
      .delete(`/api/watchlist/1/movies/${created.body.id}`)
      .set(auth(childToken));

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Access denied" });
  });

  it("allows a child to delete their own movie", async () => {
    const created = await addMovie(childToken, 3, {
      title: "Child Delete Me",
      genre: "Action",
    });

    const response = await request(app)
      .delete(`/api/watchlist/3/movies/${created.body.id}`)
      .set(auth(childToken));

    expect(response.status).toBe(200);

    const list = await request(app)
      .get("/api/watchlist/3")
      .set(auth(parentToken));

    expect(
      list.body.find((movie) => movie.id === created.body.id)
    ).toBeUndefined();
  });

  it("returns 404 for a missing movie", async () => {
    const response = await request(app)
      .delete("/api/watchlist/3/movies/999999")
      .set(auth(parentToken));

    expect(response.status).toBe(404);
  });

  it("returns 400 for an invalid movie id", async () => {
    const response = await request(app)
      .delete("/api/watchlist/3/movies/abc")
      .set(auth(parentToken));

    expect(response.status).toBe(400);
  });
});

describe("request validation and error responses", () => {
  it("returns 400 for malformed JSON", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"username":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid JSON body." });
  });

  it("returns 404 JSON for unknown routes", async () => {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Route not found." });
  });

  it("returns 403 for an authenticated user with an unknown role", async () => {
    const token = jwt.sign(
      { id: 1, username: "dad_miller", role: "guest" },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .post("/api/watchlist/1/movies")
      .set(auth(token))
      .send({ title: "Blocked Role", genre: "Action" });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Access denied" });
  });

  it("rejects payloads larger than the configured limit", async () => {
    const response = await addMovie(parentToken, 3, {
      title: "a".repeat(11 * 1024),
      genre: "Action",
    });

    expect(response.status).toBe(413);
  });
});
