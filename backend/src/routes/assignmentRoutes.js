const express = require("express");

const {
    createAssignment,
    getAssignments,
    getAssignmentById,
    submitAssignment
} = require("../controllers/assignmentController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createAssignment);

router.get("/", authenticateToken, getAssignments);

router.get("/:id", authenticateToken, getAssignmentById);

router.post("/:id/submit", authenticateToken, submitAssignment);

module.exports = router;