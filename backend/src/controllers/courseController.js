const pool = require("../config/db");

// Get courses belonging to the logged-in tenant
const getCourses = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const result = await pool.query(
            `SELECT id, title, description
             FROM courses
             WHERE tenant_id = $1
             ORDER BY id`,
            [tenantId]
        );

        res.json({
            tenant_id: tenantId,
            courses: result.rows
        });

    } catch (error) {
        console.error("Course error:", error);

        res.status(500).json({
            message: "Failed to fetch courses"
        });
    }
};


// Create a course for the logged-in tenant
const createCourse = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Course title is required"
            });
        }

        const tenantId = req.user.tenant_id;
        const teacherId = req.user.id;

        const result = await pool.query(
            `INSERT INTO courses
             (tenant_id, teacher_id, title, description)
             VALUES ($1, $2, $3, $4)
             RETURNING id, tenant_id, teacher_id, title, description`,
            [tenantId, teacherId, title, description || null]
        );

        res.status(201).json({
            message: "Course created successfully",
            course: result.rows[0]
        });

    } catch (error) {
        console.error("Create course error:", error);

        res.status(500).json({
            message: "Failed to create course"
        });
    }
};


module.exports = {
    getCourses,
    createCourse
};