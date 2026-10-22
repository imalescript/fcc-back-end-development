import { describe, it, expect } from "@jest/globals";
import jwt from "jsonwebtoken";
import { AuthService } from "../../services/auth-service.js";
import { config } from "../../config.js";

const authService = new AuthService(config);

describe("AuthService.login", () => {
  it.each([
    ["dad_miller", "parent456", 1, "parent"],
    ["mom_miller", "parent123", 2, "parent"],
    ["jake_miller", "child123", 3, "child"],
    ["sophie_miller", "child456", 4, "child"],
  ])(
    "returns a valid token for %s",
    async (username, password, id, role) => {
      const token = await authService.login(username, password);

      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, config.jwtSecret);

      expect(decoded).toMatchObject({ id, username, role });
      expect(decoded.exp - decoded.iat).toBe(3600);
    }
  );

  it("returns null for an unknown username", async () => {
    await expect(authService.login("nobody", "whatever")).resolves.toBeNull();
  });

  it("returns null for a wrong password", async () => {
    await expect(
      authService.login("dad_miller", "wrong-password")
    ).resolves.toBeNull();
  });

  it("returns null for non-string credentials", async () => {
    await expect(authService.login(123, "password")).resolves.toBeNull();
    await expect(authService.login("dad_miller", 123)).resolves.toBeNull();
  });

  it("trims the username before lookup", async () => {
    const token = await authService.login("  dad_miller  ", "parent456");

    expect(typeof token).toBe("string");
    expect(jwt.verify(token, config.jwtSecret)).toMatchObject({
      id: 1,
      username: "dad_miller",
    });
  });

  it("uses the configured token lifetime", async () => {
    const shortLivedService = new AuthService({
      ...config,
      tokenTtl: "15m",
    });

    const token = await shortLivedService.login("dad_miller", "parent456");
    const decoded = jwt.verify(token, config.jwtSecret);

    expect(decoded.exp - decoded.iat).toBe(900);
  });
});
