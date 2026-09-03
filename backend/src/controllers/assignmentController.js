const pool = require("../config/db");

// Create an assignment
const createAssignment = async (req, res) => {
    try {
        const { course_id, title, description, due_date } = req.body;
        const tenantId = req.user.tenant_id;

        if (!course_id || !title) {
            return res.status(400).json({
                message: "course_id and title are required"
            });
        }

        // Make sure the course belongs to the logged-in user's tenant
        const courseCheck = await pool.query(
            "SELECT id FROM courses WHERE id = $1 AND tenant_id = $2",
            [course_id, tenantId]
        );

        if (courseCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Course not found in your tenant"
            });
        }

        const result = await pool.query(
            `INSERT INTO assignments
             (course_id, title, description, due_date)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [course_id, title, description || null, due_date || null]
        );

        res.status(201).json({
            message: "Assignment created successfully",
            assignment: result.rows[0]
        });

    } catch (error) {
        console.error("Create assignment error:", error);

        res.status(500).json({
            message: "Failed to create assignment",
            error: error.message
        });
    }
};


// Get all assignments for the logged-in tenant
const getAssignments = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const result = await pool.query(
            `SELECT
                a.id,
                a.course_id,
                a.title,
                a.description,
                a.due_date
             FROM assignments a
             JOIN courses c ON a.course_id = c.id
             WHERE c.tenant_id = $1
             ORDER BY a.id`,
            [tenantId]
        );

        res.json({
            tenant_id: tenantId,
            assignments: result.rows
        });

    } catch (error) {
        console.error("Get assignments error:", error);

        res.status(500).json({
            message: "Failed to fetch assignments",
            error: error.message
        });
    }
};


// Get one assignment
const getAssignmentById = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const tenantId = req.user.tenant_id;

        const result = await pool.query(
            `SELECT
                a.id,
                a.course_id,
                a.title,
                a.description,
                a.due_date
             FROM assignments a
             JOIN courses c ON a.course_id = c.id
             WHERE a.id = $1
             AND c.tenant_id = $2`,
            [assignmentId, tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Get assignment error:", error);

        res.status(500).json({
            message: "Failed to fetch assignment",
            error: error.message
        });
    }
};


// Submit an assignment
const submitAssignment = async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const userId = req.user.id;
        const tenantId = req.user.tenant_id;

        // Make sure assignment belongs to the user's tenant
        const assignmentCheck = await pool.query(
            `SELECT a.id
             FROM assignments a
             JOIN courses c ON a.course_id = c.id
             WHERE a.id = $1
             AND c.tenant_id = $2`,
            [assignmentId, tenantId]
        );

        if (assignmentCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        // Prevent duplicate submission
        const existingSubmission = await pool.query(
            `SELECT id
             FROM submissions
             WHERE assignment_id = $1
             AND user_id = $2`,
            [assignmentId, userId]
        );

        if (existingSubmission.rows.length > 0) {
            return res.status(409).json({
                message: "Assignment already submitted"
            });
        }

        const result = await pool.query(
            `INSERT INTO submissions
             (assignment_id, user_id)
             VALUES ($1, $2)
             RETURNING *`,
            [assignmentId, userId]
        );

        res.status(201).json({
            message: "Assignment submitted successfully",
            submission: result.rows[0]
        });

    } catch (error) {
        console.error("Submit assignment error:", error);

        res.status(500).json({
            message: "Failed to submit assignment",
            error: error.message
        });
    }
};


module.exports = {
    createAssignment,
    getAssignments,
    getAssignmentById,
    submitAssignment
};