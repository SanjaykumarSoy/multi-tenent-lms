const express = require("express");

const {
    createSubscription,
    getSubscription,
    cancelSubscription
} = require("../controllers/subscriptionController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createSubscription);

router.get("/", authenticateToken, getSubscription);

router.put("/cancel", authenticateToken, cancelSubscription);

module.exports = router;