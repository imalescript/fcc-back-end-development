import { app } from "./app.js";
import { config } from "./config.js";

export { app };

export const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}...`);
});
