import express from "express";
import { registerRoutes } from "../server/routes";

// Create an express app per invocation
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register only API routes (no static handling here)
let serverPromise: Promise<void> | null = null;
function ensureRoutes() {
  if (!serverPromise) {
    serverPromise = (async () => {
      await registerRoutes(app);
    })();
  }
  return serverPromise;
}

export default async function handler(req: any, res: any) {
  await ensureRoutes();
  return app(req, res);
}


