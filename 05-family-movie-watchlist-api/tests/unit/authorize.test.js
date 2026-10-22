import { describe, it, expect, jest } from "@jest/globals";
import { authorizeModification } from "../../middleware/authorize.js";

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const runAuthorize = (user, params = {}) => {
  const req = { user, params };
  const res = createResponse();
  const next = jest.fn();

  authorizeModification(req, res, next);

  return { res, next };
};

describe("authorizeModification middleware", () => {
  it("allows a parent to target another user", () => {
    const { res, next } = runAuthorize(
      { id: 1, role: "parent" },
      { userId: "3" }
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("allows a parent even when params are missing", () => {
    const { next } = runAuthorize({ id: 1, role: "parent" });

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("allows a child to target themselves using a string id", () => {
    const { next } = runAuthorize(
      { id: 3, role: "child" },
      { userId: "3" }
    );

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("allows a child to target themselves using a numeric id", () => {
    const { next } = runAuthorize({ id: 3, role: "child" }, { userId: 3 });

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("denies a child targeting another user", () => {
    const { res, next } = runAuthorize(
      { id: 3, role: "child" },
      { userId: "1" }
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Access denied" });
    expect(next).not.toHaveBeenCalled();
  });

  it("denies a user with an unknown role", () => {
    const { res, next } = runAuthorize(
      { id: 1, role: "guest" },
      { userId: "1" }
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Access denied" });
    expect(next).not.toHaveBeenCalled();
  });

  it("denies a request without a decoded user", () => {
    const { res, next } = runAuthorize(undefined, { userId: "1" });

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Access denied" });
    expect(next).not.toHaveBeenCalled();
  });
});
