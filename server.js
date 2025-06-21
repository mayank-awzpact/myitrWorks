require("dotenv").config();

const express = require("express");
const cors = require("cors"); // ✅ Import cors
const path = require("path");
const app = express();
const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit");
const userRoutes = require("./routes/userRoutes");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requests per IP
  message: {
    status: 429,
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
});

// ✅ Middleware efeefe
app.use(cors()); // ✅ Enable CORS for all origins
app.use(express.json());

app.use("/api/", apiLimiter);
// ✅ Routes
app.use("/api/users", userRoutes);

// ✅ DB Connection
connectDB();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
