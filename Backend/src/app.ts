import express, { Express, Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env.config";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

const app: Express = express();

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://dayflow-dev.vercel.app",
  "https://odoo-hackathon-dayflow-3pxy.vercel.app",
];

const envOrigins = config.corsOrigin
  ? config.corsOrigin.split(",").map((o) => o.trim())
  : [];

const corsOptions: cors.CorsOptions = {
  origin: (requestOrigin, callback) => {
    // Allow server-to-server, Postman, curl, or requests with no origin header
    if (!requestOrigin) return callback(null, true);

    if (
      defaultAllowedOrigins.includes(requestOrigin) ||
      envOrigins.includes(requestOrigin) ||
      envOrigins.includes("*") ||
      requestOrigin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    // Dynamically mirror request origin to prevent browser CORS credential errors
    return callback(null, requestOrigin);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "Dayflow HRMS Backend API",
  });
});

// Support both /api/v1 and /api base paths
app.use("/api/v1", routes);
app.use("/api", routes);

app.use(errorHandler);

export default app;
