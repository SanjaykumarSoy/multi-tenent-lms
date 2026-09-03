const pool = require("../config/db");

// Create a quiz
const createQuiz = async (req, res) => {
    try {
        const { course_id, title, max_attempts } = req.body;
        const tenantId = req.user.tenant_id;

        if (!course_id || !title) {
            return res.status(400).json({
                message: "course_id and title are required"
            });
        }

        // Check that the course belongs to the user's tenant
        const courseCheck = await pool.query(
            `SELECT id
             FROM courses
             WHERE id = $1 AND tenant_id = $2`,
            [course_id, tenantId]
        );

        if (courseCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Course not found in your tenant"
            });
        }

        const result = await pool.query(
            `INSERT INTO quizzes
             (course_id, title, max_attempts)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [course_id, title, max_attempts || null]
        );

        res.status(201).json({
            message: "Quiz created successfully",
            quiz: result.rows[0]
        });

    } catch (error) {
        console.error("Create quiz error:", error);

        res.status(500).json({
            message: "Failed to create quiz",
            error: error.message
        });
    }
};


// Get quizzes for the logged-in tenant
const getQuizzes = async (req, res) => {
    try {
        const tenantId = req.user.tenant_id;

        const result = await pool.query(
            `SELECT
                q.id,
                q.course_id,
                q.title,
                q.max_attempts
             FROM quizzes q
             JOIN courses c ON q.course_id = c.id
             WHERE c.tenant_id = $1
             ORDER BY q.id`,
            [tenantId]
        );

        res.json({
            tenant_id: tenantId,
            quizzes: result.rows
        });

    } catch (error) {
        console.error("Get quizzes error:", error);

        res.status(500).json({
            message: "Failed to fetch quizzes",
            error: error.message
        });
    }
};


// Add a question to a quiz
const addQuestion = async (req, res) => {
    try {
        const quizId = req.params.id;
        const { question_text } = req.body;
        const tenantId = req.user.tenant_id;

        if (!question_text) {
            return res.status(400).json({
                message: "question_text is required"
            });
        }

        // Check quiz belongs to user's tenant
        const quizCheck = await pool.query(
            `SELECT q.id
             FROM quizzes q
             JOIN courses c ON q.course_id = c.id
             WHERE q.id = $1
             AND c.tenant_id = $2`,
            [quizId, tenantId]
        );

        if (quizCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO quiz_questions
             (quiz_id, question_text)
             VALUES ($1, $2)
             RETURNING *`,
            [quizId, question_text]
        );

        res.status(201).json({
            message: "Question added successfully",
            question: result.rows[0]
        });

    } catch (error) {
        console.error("Add question error:", error);

        res.status(500).json({
            message: "Failed to add question",
            error: error.message
        });
    }
};


// Get questions for a quiz
const getQuestions = async (req, res) => {
    try {
        const quizId = req.params.id;
        const tenantId = req.user.tenant_id;

        const result = await pool.query(
            `SELECT
                qq.id,
                qq.quiz_id,
                qq.question_text
             FROM quiz_questions qq
             JOIN quizzes q ON qq.quiz_id = q.id
             JOIN courses c ON q.course_id = c.id
             WHERE qq.quiz_id = $1
             AND c.tenant_id = $2
             ORDER BY qq.id`,
            [quizId, tenantId]
        );

        res.json({
            quiz_id: Number(quizId),
            questions: result.rows
        });

    } catch (error) {
        console.error("Get questions error:", error);

        res.status(500).json({
            message: "Failed to fetch questions",
            error: error.message
        });
    }
};


// Submit a quiz result
const submitQuizResult = async (req, res) => {
    try {
        const quizId = req.params.id;
        const { score } = req.body;
        const userId = req.user.id;
        const tenantId = req.user.tenant_id;

        if (score === undefined || score === null) {
            return res.status(400).json({
                message: "score is required"
            });
        }

        // Check quiz belongs to user's tenant
        const quizCheck = await pool.query(
            `SELECT q.id
             FROM quizzes q
             JOIN courses c ON q.course_id = c.id
             WHERE q.id = $1
             AND c.tenant_id = $2`,
            [quizId, tenantId]
        );

        if (quizCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Quiz not found"
            });
        }

        const result = await pool.query(
            `INSERT INTO quiz_results
             (quiz_id, user_id, score)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [quizId, userId, score]
        );

        res.status(201).json({
            message: "Quiz result submitted successfully",
            result: result.rows[0]
        });

    } catch (error) {
        console.error("Submit quiz result error:", error);

        res.status(500).json({
            message: "Failed to submit quiz result",
            error: error.message
        });
    }
};


// Get quiz results
const getQuizResults = async (req, res) => {
    try {
        const quizId = req.params.id;
        const tenantId = req.user.tenant_id;

        const result = await pool.query(
            `SELECT
                qr.id,
                qr.quiz_id,
                qr.user_id,
                qr.score
             FROM quiz_results qr
             JOIN quizzes q ON qr.quiz_id = q.id
             JOIN courses c ON q.course_id = c.id
             WHERE qr.quiz_id = $1
             AND c.tenant_id = $2
             ORDER BY qr.id`,
            [quizId, tenantId]
        );

        res.json({
            quiz_id: Number(quizId),
            results: result.rows
        });

    } catch (error) {
        console.error("Get quiz results error:", error);

        res.status(500).json({
            message: "Failed to fetch quiz results",
            error: error.message
        });
    }
};


module.exports = {
    createQuiz,
    getQuizzes,
    addQuestion,
    getQuestions,
    submitQuizResult,
    getQuizResults
};