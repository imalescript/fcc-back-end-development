import { describe, it, expect, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import { authenticate } from "../../middleware/authenticate.js";
import { config } from "../../config.js";

const tokenPayload = { id: 3, username: "jake_miller", role: "child" };

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const runAuthenticate = (authorization) => {
  const req = {
    headers: authorization === undefined ? {} : { authorization },
  };
  const res = createResponse();
  const next = jest.fn();

  authenticate(req, res, next);

  return { req, res, next };
};

describe("authenticate middleware", () => {
  it("returns 401 when the Authorization header is missing", () => {
    const { res, next } = runAuthenticate(undefined);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided." });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when the Authorization scheme is not Bearer", () => {
    const { res, next } = runAuthenticate("Basic abc123");

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided." });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when the Bearer token is empty", () => {
    const { res, next } = runAuthenticate("Bearer ");

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided." });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for a malformed token", () => {
    const { res, next } = runAuthenticate("Bearer not-a-token");

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for a token signed with another secret", () => {
    const token = jwt.sign(tokenPayload, "different-secret");
    const { res, next } = runAuthenticate(`Bearer ${token}`);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 for an expired token", () => {
    const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: -1 });
    const { res, next } = runAuthenticate(`Bearer ${token}`);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the decoded token and calls next for a valid token", () => {
    const token = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: "1h",
    });
    const { req, res, next } = runAuthenticate(`Bearer ${token}`);

    expect(req.user).toMatchObject(tokenPayload);
    expect(req.user).toHaveProperty("iat");
    expect(req.user).toHaveProperty("exp");
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("accepts a case-insensitive scheme and extra whitespace", () => {
    const token = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: "1h",
    });
    const { req, next } = runAuthenticate(`bearer   ${token}`);

    expect(req.user).toMatchObject(tokenPayload);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
