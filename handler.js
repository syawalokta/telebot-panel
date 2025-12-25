import fs from "fs";
import path from "path";

export default async bot => {
  const pluginsPath = "./plugins";

  for (const file of fs.readdirSync(pluginsPath)) {
    if (!file.endsWith(".js")) continue;

    try {
      const plugin = await import(`./plugins/${file}`);
      plugin.default(bot);
      console.log("✔ Plugin loaded:", file);
    } catch (err) {
      console.error("✖ Failed load plugin:", file);
      console.error(err.message);
    }
  }
};