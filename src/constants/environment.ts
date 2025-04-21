import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;

export const DISCORD_DEVELOPMENT_CHANNEL_ID =
  process.env.DISCORD_DEVELOPMENT_CHANNEL_ID!;

export const DISCORD_STAGING_CHANNEL_ID =
  process.env.DISCORD_STAGING_CHANNEL_ID!;

export const DISCORD_PRODUCTION_CHANNEL_ID =
  process.env.DISCORD_PRODUCTION_CHANNEL_ID!;
