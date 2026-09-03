const pool = require("../config/db");

// Create or activate a subscription
const createSubscription = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;
        const { plan } = req.body;

        if (!plan) {
            return res.status(400).json({
                message: "plan is required"
            });
        }

        const validPlans = ["FREE", "BASIC", "PREMIUM"];

        if (!validPlans.includes(plan.toUpperCase())) {
            return res.status(400).json({
                message: "Invalid plan. Use FREE, BASIC, or PREMIUM"
            });
        }

        // Check if tenant already has a subscription
        const existing = await pool.query(
            `SELECT id
             FROM subscriptions
             WHERE tenant_id = $1`,
            [tenantId]
        );

        let result;

        if (existing.rows.length > 0) {
            result = await pool.query(
                `UPDATE subscriptions
                 SET plan = $1, status = 'ACTIVE'
                 WHERE tenant_id = $2
                 RETURNING *`,
                [plan.toUpperCase(), tenantId]
            );
        } else {
            result = await pool.query(
                `INSERT INTO subscriptions
                 (tenant_id, plan, status)
                 VALUES ($1, $2, 'ACTIVE')
                 RETURNING *`,
                [tenantId, plan.toUpperCase()]
            );
        }

        res.status(201).json({
            message: "Subscription activated successfully",
            subscription: result.rows[0]
        });

    } catch (error) {
        console.error("Create subscription error:", error);

        res.status(500).json({
            message: "Failed to create subscription",
            error: error.message
        });
    }
};


// Get current tenant subscription
const getSubscription = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const result = await pool.query(
            `SELECT *
             FROM subscriptions
             WHERE tenant_id = $1`,
            [tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No subscription found"
            });
        }

        res.json({
            subscription: result.rows[0]
        });

    } catch (error) {
        console.error("Get subscription error:", error);

        res.status(500).json({
            message: "Failed to fetch subscription",
            error: error.message
        });
    }
};


// Cancel subscription
const cancelSubscription = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const result = await pool.query(
            `UPDATE subscriptions
             SET status = 'CANCELLED'
             WHERE tenant_id = $1
             RETURNING *`,
            [tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No subscription found"
            });
        }

        res.json({
            message: "Subscription cancelled successfully",
            subscription: result.rows[0]
        });

    } catch (error) {
        console.error("Cancel subscription error:", error);

        res.status(500).json({
            message: "Failed to cancel subscription",
            error: error.message
        });
    }
};


module.exports = {
    createSubscription,
    getSubscription,
    cancelSubscription
};