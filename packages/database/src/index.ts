import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Find the .env file in the packages/database directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
export * from "./generated/prisma/client.js";


