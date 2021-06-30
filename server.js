const express = require("express");
const connectDB = require("./config/db");
const usersRouter = require("./routes/api/users");
const authRouter = require("./routes/api/auth");
const profileRouter = require("./routes/api/profile");
const postsRouter = require("./routes/api/posts");

const app = express();

// Connect Database
connectDB();

app.get("/", (req, res) => {
  res.send("API RUNNING");
});

// Define Routes
app.use("/api", usersRouter);
app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", postsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
