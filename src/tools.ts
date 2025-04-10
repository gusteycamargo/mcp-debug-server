import fs from "fs/promises";
import path from "path";
import { SOURCE_DIR } from "./constants/dirs.js";

const filenames = await fs.readdir(path.resolve(SOURCE_DIR, "tools"));

for (const filename of filenames) {
  await import(path.resolve(SOURCE_DIR, "tools", filename));
}
