import * as fs from "fs";
import * as process from "process";
import logger from "./logger.js";
import api from "../shared/common/api.js";

// Try multiple paths to find the token.env file
const possiblePaths = [
  process.env.ENVPATH,
  "./token.env", // If placed in backend/
  "../token.env", // If placed in the root of the repo (common on Render)
].filter(Boolean) as string[];

let envFilePath = "";

const savedTokens: string[] = [];
let index = 0;

// Tokens that hit rate limit are cooled down for 15 minutes.
const COOLDOWN_MS = 15 * 60 * 1000;
const exhaustedUntil = new Map<string, number>();

export const initTokenFromEnv = async () => {
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      envFilePath = p;
      break;
    }
  }

  if (!envFilePath) {
    logger.error("Token file not found. Tried: ", possiblePaths.join(", "));
    process.exit(-1);
  }
  const envTokenString = fs.readFileSync(envFilePath).toString();
  if (!envTokenString) {
    logger.error("Token not found");
    process.exit(-1);
  }

  const tokenList = envTokenString.split(/\r?\n/);
  // Call GitHub API to check token usability
  for (const token of tokenList) {
    const trimmed = token.trim();
    if (!trimmed) continue;
    try {
      await api.getRepoStargazersCount("star-history/star-history", trimmed);
      savedTokens.push(trimmed);
    } catch (error) {
      logger.error(`Token ${trimmed.slice(0, 8)}...${trimmed.slice(-4)} is unusable`, error);
    }
  }

  if (savedTokens.length === 0) {
    logger.error("No usable token");
    process.exit(-1);
  }

  logger.info(`Usable token amount: ${savedTokens.length}`);
};

// Mark a token as rate-limited so it is skipped for COOLDOWN_MS.
export const markTokenExhausted = (token: string) => {
  exhaustedUntil.set(token, Date.now() + COOLDOWN_MS);
  logger.warn(`Token ${token.slice(0, 8)}... rate-limited, cooling down for ${COOLDOWN_MS / 60000}m`);
};

// Get the next available token, skipping rate-limited ones.
// Returns null if all tokens are exhausted.
export const getNextToken = (): string | null => {
  const now = Date.now();
  for (let i = 0; i < savedTokens.length; i++) {
    index = (index + 1) % savedTokens.length;
    const token = savedTokens[index];
    const until = exhaustedUntil.get(token);
    if (!until || now >= until) {
      if (until) exhaustedUntil.delete(token);
      return token;
    }
  }
  return null;
};
