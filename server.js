const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const authRoutes = require("./routes");

const app = express();
const PORT = process.env.PORT || 11032;

app.use(cors());
app.use(express.json());

// API routes
app.use("/api", authRoutes);

// Serve frontend build dari ~/gis/public
app.use(express.static(path.join(__dirname, "../public")));

// Fallback ke React index.html untuk semua route yang bukan API
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
