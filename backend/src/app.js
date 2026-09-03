const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const courseRoutes = require("./routes/courseRoutes");
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const authenticateToken = require("./middleware/authMiddleware");
const assignmentRoutes = require("./routes/assignmentRoutes");
const quizRoutes = require("./routes/quizRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
            message: "Invalid JSON payload"
        });
    }

    next(err);
});
app.get("/", (req, res) => {
    res.send("Cloud LMS Backend running");
});

app.get("/api/profile", authenticateToken, (req, res) => {
    res.json({
        message: "Authenticated successfully",
        user: req.user
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected successfully",
            time: result.rows[0].now
        });
    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});
app.get("/api/users", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, tenant_id, email, role FROM users"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Users error:", error);

        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on ${PORT}`);
});

module.exports = app;