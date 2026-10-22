const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/g;
const MAX_TITLE_LENGTH = 200;
const MAX_GENRE_LENGTH = 80;

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.status = 400;
  }
}

const requireObject = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("A JSON object is required.");
  }
};

const cleanText = (value, field, maxLength) => {
  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string.`);
  }

  const cleaned = value.replace(CONTROL_CHARACTERS, "").trim();

  if (cleaned.length === 0) {
    throw new ValidationError(`${field} cannot be empty.`);
  }

  if (cleaned.length > maxLength) {
    throw new ValidationError(
      `${field} must be ${maxLength} characters or fewer.`
    );
  }

  return cleaned;
};

export class MovieInput {
  create(body) {
    requireObject(body);

    if (!Object.hasOwn(body, "title")) {
      throw new ValidationError("title is required.");
    }

    const movie = {
      title: cleanText(body.title, "title", MAX_TITLE_LENGTH),
    };

    if (Object.hasOwn(body, "genre")) {
      movie.genre = cleanText(body.genre, "genre", MAX_GENRE_LENGTH);
    }

    return movie;
  }

  update(body) {
    requireObject(body);

    const updates = {};

    if (Object.hasOwn(body, "title")) {
      updates.title = cleanText(body.title, "title", MAX_TITLE_LENGTH);
    }

    if (Object.hasOwn(body, "genre")) {
      updates.genre = cleanText(body.genre, "genre", MAX_GENRE_LENGTH);
    }

    if (Object.hasOwn(body, "watched")) {
      if (typeof body.watched !== "boolean") {
        throw new ValidationError("watched must be a boolean.");
      }

      updates.watched = body.watched;
    }

    if (Object.keys(updates).length === 0) {
      throw new ValidationError(
        "At least one of title, genre, or watched is required."
      );
    }

    return updates;
  }
}

export const movieInput = new MovieInput();

export const parseId = (value) => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};
