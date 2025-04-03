const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");
const authRoutes = require("./auth");
const investmentRoutes = require("./routes/investments");


const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/investments", investmentRoutes);

app.get("/", (req, res) => {
  res.send("Investment Tracker API is running!");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
