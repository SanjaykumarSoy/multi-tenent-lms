const express = require("express");

const {
    createQuiz,
    getQuizzes,
    addQuestion,
    getQuestions,
    submitQuizResult,
    getQuizResults
} = require("../controllers/quizController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createQuiz);

router.get("/", authenticateToken, getQuizzes);

router.post("/:id/questions", authenticateToken, addQuestion);

router.get("/:id/questions", authenticateToken, getQuestions);

router.post("/:id/results", authenticateToken, submitQuizResult);

router.get("/:id/results", authenticateToken, getQuizResults);

module.exports = router;