export function notFoundHandler(req, res) {
  return res.status(404).json({ error: "Route not found." });
}

export function errorHandler(err, req, res, _next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body." });
  }

  const status =
    Number.isInteger(err.status) && err.status >= 400 && err.status <= 599
      ? err.status
      : 500;

  if (status >= 500) {
    console.error(err);
  }

  return res.status(status).json({
    error:
      status >= 500 ? "Internal server error." : err.message || "Request failed.",
  });
}
