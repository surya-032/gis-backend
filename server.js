const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes API (auth, register, login, dll)
app.use("/api", authRoutes);

// Serve static files (hasil build React)
app.use(express.static(path.join(__dirname, "../public")));

// React Router fallback (biar bisa refresh halaman non-root)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
