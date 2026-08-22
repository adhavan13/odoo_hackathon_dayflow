import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

const app: Express = express();

// 1. Double slash normalizer & URL cleaner middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url && req.url.includes("//")) {
    req.url = req.url.replace(/\/+/g, "/");
  }
  next();
});

// 2. Universal CORS headers middleware allowing ALL origins & custom headers
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform, User-Agent, Referer, X-Api-Key, X-CSRF-Token"
  );
  res.setHeader("Access-Control-Expose-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// 3. Fallback express cors plugin configured for dynamic origins
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root open route to display API status
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Dayflow HRMS Backend API is running successfully",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "Dayflow HRMS Backend API",
    endpoints: {
      health: "/api/health",
      auth: "/api/v1/auth",
      employees: "/api/v1/employees",
      attendance: "/api/v1/attendance",
      leave: "/api/v1/leave",
      payroll: "/api/v1/payroll",
    },
  });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "Dayflow HRMS Backend API",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Support all route mounting schemes: /api/v1, /api, /auth, and root /
app.use("/api/v1", routes);
app.use("/api", routes);
app.use("/auth", routes);
app.use("/", routes);

app.use(errorHandler);

export default app;
