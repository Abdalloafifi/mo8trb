// ------------------ [ 1. استدعاء الحزم ] ------------------
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
const securityMiddleware = require('./middlewares/securityMiddleware');


// ------------------ [ 2. إعداد المتغيرات من .env ] ------------------
dotenv.config();

// ------------------ [ 3. إصلاح __dirname ] ------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------ [ 4. تهيئة التطبيق ] ------------------
const app = express();
securityMiddleware(app)


// ------------------ [ 5. الاتصال بقاعدة البيانات ] ------------------
connectDB();

// ------------------ [ 6. ميدلوير أساسية ] ------------------
app.use(
  compression({
    threshold: 1024,
    level: 6,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));

// ------------------ [ 7. إعدادات rate limiting ] ------------------
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// ------------------ [ 8. تسجيل الطلبات ] ------------------
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// ------------------ [ 9. مسارات الاستخدام ] ------------------
import userRoutes from "./routes/users.js";
import apartmentRoutes from "./routes/apartments.js";
import commentRoutes from "./routes/reviewRoutes.js";
import savedSearchRoutes from "./routes/savedSearchRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";

app.use("/api/users", userRoutes);
app.use("/api/apartments", apartmentRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/saved-search", savedSearchRoutes);
app.use("/api/images", imageRoutes);

// ------------------ [ 10. ملفات ثابتة ] ------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------ [ 11. روتات بسيطة ] ------------------
app.get("/", (req, res) => res.json({ message: "Real Estate API is running!" }));
app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));

// ------------------ [ 12. معالجة الأخطاء ] ------------------
app.use((err, req, res, next) => {
  console.error("Error:", err);
  if (err.name === 'MulterError') {
    const msg = err.code === 'LIMIT_FILE_SIZE' ?
      'File too large.' : 'File upload error.';
    return res.status(400).json({ success: false, message: msg });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

// ------------------ [ 13. 404 handler ] ------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ------------------ [ 14. بدء الخادم ] ------------------
const PORT = process.env.PORT || 6001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
