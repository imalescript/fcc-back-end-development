import { describe, it, expect, jest, afterEach } from "@jest/globals";
import {
  errorHandler,
  notFoundHandler,
} from "../../middleware/error-handler.js";

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe("notFoundHandler", () => {
  it("returns a 404 JSON response", () => {
    const res = createResponse();

    notFoundHandler({}, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Route not found." });
  });
});

describe("errorHandler", () => {
  it("returns 400 for malformed JSON bodies", () => {
    const res = createResponse();
    const error = Object.assign(new Error("Unexpected token"), {
      type: "entity.parse.failed",
    });

    errorHandler(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid JSON body." });
  });

  it("uses a safe 4xx status and exposes its message", () => {
    const res = createResponse();
    const error = Object.assign(new Error("Movie not found."), { status: 404 });

    errorHandler(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Movie not found." });
  });

  it("returns a generic 500 response and logs the error", () => {
    const res = createResponse();
    const error = new Error("database exploded");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(error, {}, res, jest.fn());

    expect(consoleSpy).toHaveBeenCalledWith(error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error.",
    });
  });

  it("rejects invalid HTTP status codes", () => {
    const res = createResponse();
    const error = Object.assign(new Error("Odd status"), { status: 200 });
    jest.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
