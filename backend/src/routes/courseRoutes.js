const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
    getCourses,
    createCourse
} = require("../controllers/courseController");

router.get("/", authenticateToken, getCourses);

router.post("/", authenticateToken, createCourse);

module.exports = router;