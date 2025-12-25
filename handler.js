import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default bot => {
  const pluginDir = path.join(__dirname, "plugins");
  for (const file of fs.readdirSync(pluginDir)) {
    if (file.endsWith(".js")) {
      import(path.join(pluginDir, file)).then(plugin => {
        plugin.default(bot);
      });
    }
  }
};