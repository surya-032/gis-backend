const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/", authRoutes);

app.listen(PORT, () => {
    console.log(`Server berjalan di 192.168.4.4:${PORT}`);
});
