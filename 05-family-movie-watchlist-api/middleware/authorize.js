/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function authorizeModification(req, res, next) {
  const { role, id } = req.user ?? {};
  const targetUserId = req.params?.userId;

  const isParent = role === "parent";
  const isSelf = role === "child" && String(targetUserId) === String(id);

  if (isParent || isSelf) {
    return next();
  }

  return res.status(403).json({ error: "Access denied" });
}
