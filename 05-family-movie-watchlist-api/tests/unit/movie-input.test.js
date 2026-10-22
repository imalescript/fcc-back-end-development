import { describe, it, expect } from "@jest/globals";
import {
  MovieInput,
  ValidationError,
  parseId,
} from "../../utils/movie-input.js";

const movieInput = new MovieInput();

describe("MovieInput.create", () => {
  it("sanitizes text and ignores unknown fields", () => {
    const movie = movieInput.create({
      title: "  The Dark Knight\u0000  ",
      genre: " Action ",
      watched: true,
      hijack: "ignored",
    });

    expect(movie).toEqual({
      title: "The Dark Knight",
      genre: "Action",
    });
  });

  it("allows a missing genre", () => {
    expect(movieInput.create({ title: "Inception" })).toEqual({
      title: "Inception",
    });
  });

  it("rejects a body that is not an object", () => {
    expect(() => movieInput.create(null)).toThrow(ValidationError);
    expect(() => movieInput.create([])).toThrow(ValidationError);
    expect(() => movieInput.create("movie")).toThrow(ValidationError);
  });

  it("requires an own title property", () => {
    expect(() => movieInput.create({ genre: "Action" })).toThrow(
      "title is required."
    );

    const inheritedTitle = Object.create({ title: "Inherited" });
    inheritedTitle.genre = "Action";

    expect(() => movieInput.create(inheritedTitle)).toThrow(
      "title is required."
    );
  });

  it("rejects a non-string title", () => {
    expect(() => movieInput.create({ title: 123 })).toThrow(
      "title must be a string."
    );
  });

  it("rejects an empty title", () => {
    expect(() => movieInput.create({ title: "   " })).toThrow(
      "title cannot be empty."
    );
  });

  it("rejects a title over 200 characters", () => {
    expect(() => movieInput.create({ title: "a".repeat(201) })).toThrow(
      "title must be 200 characters or fewer."
    );
  });

  it("rejects an empty genre", () => {
    expect(() =>
      movieInput.create({ title: "Movie", genre: "" })
    ).toThrow("genre cannot be empty.");
  });
});

describe("MovieInput.update", () => {
  it("returns only whitelisted fields", () => {
    const updates = movieInput.update({
      title: "  New Title ",
      genre: " Drama ",
      watched: true,
      hijack: "ignored",
      id: 999,
    });

    expect(updates).toEqual({
      title: "New Title",
      genre: "Drama",
      watched: true,
    });
  });

  it("allows partial updates", () => {
    expect(movieInput.update({ title: "Only title" })).toEqual({
      title: "Only title",
    });
    expect(movieInput.update({ watched: false })).toEqual({ watched: false });
  });

  it("rejects a non-boolean watched value", () => {
    expect(() => movieInput.update({ watched: "true" })).toThrow(
      "watched must be a boolean."
    );
  });

  it("rejects an empty update", () => {
    expect(() => movieInput.update({})).toThrow(
      "At least one of title, genre, or watched is required."
    );
  });

  it("rejects an update with only unknown fields", () => {
    expect(() => movieInput.update({ hijack: true })).toThrow(
      "At least one of title, genre, or watched is required."
    );
  });

  it("ignores prototype-pollution style keys", () => {
    const body = JSON.parse(
      '{"title":"Safe","__proto__":{"polluted":true},"constructor":"ignored"}'
    );

    expect(movieInput.update(body)).toEqual({ title: "Safe" });
    expect({}.polluted).toBeUndefined();
  });
});

describe("parseId", () => {
  it("parses positive integer strings", () => {
    expect(parseId("1")).toBe(1);
    expect(parseId("42")).toBe(42);
  });

  it.each(["0", "-1", "1.5", "1e3", "abc", "", " 1 ", "01a"])(
    "returns null for %p",
    (value) => {
      expect(parseId(value)).toBeNull();
    }
  );

  it("returns null for unsafe integers and non-strings", () => {
    expect(parseId("999999999999999999999")).toBeNull();
    expect(parseId(1)).toBeNull();
    expect(parseId(null)).toBeNull();
  });
});

describe("ValidationError", () => {
  it("carries a 400 status", () => {
    const error = new ValidationError("bad input");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ValidationError");
    expect(error.message).toBe("bad input");
    expect(error.status).toBe(400);
  });
});
