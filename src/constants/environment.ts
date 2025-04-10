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

console.log({
  DISCORD_TOKEN,
  DISCORD_DEVELOPMENT_CHANNEL_ID,
  DISCORD_STAGING_CHANNEL_ID,
  DISCORD_PRODUCTION_CHANNEL_ID,
});

// Validação das variáveis de ambiente
if (!DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN não está definido no arquivo .env");
}

if (!DISCORD_DEVELOPMENT_CHANNEL_ID) {
  throw new Error(
    "DISCORD_DEVELOPMENT_CHANNEL_ID não está definido no arquivo .env"
  );
}

if (!DISCORD_STAGING_CHANNEL_ID) {
  throw new Error(
    "DISCORD_STAGING_CHANNEL_ID não está definido no arquivo .env"
  );
}

if (!DISCORD_PRODUCTION_CHANNEL_ID) {
  throw new Error(
    "DISCORD_PRODUCTION_CHANNEL_ID não está definido no arquivo .env"
  );
}
