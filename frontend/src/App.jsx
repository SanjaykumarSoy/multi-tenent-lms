import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
const [quizzes, setQuizzes] = useState([]);
const [selectedQuiz, setSelectedQuiz] = useState(null);
const [quizQuestions, setQuizQuestions] = useState([]);
    const [page, setPage] = useState("dashboard");
    const [loading, setLoading] = useState(false);
const [quizResults, setQuizResults] = useState([]);
const [assignments, setAssignments] = useState([]);
const [selectedAssignment, setSelectedAssignment] = useState(null);
const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        if (token) {
            fetchCourses();
            fetchQuizzes();
            fetchResults();
               fetchSubscription();
               fetchAssignments();
        }
    }, [token]);

    const handleLogin = async (event) => {
        event.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/api/auth/login`,
                {
                    email,
                    password
                }
            );

            localStorage.setItem("token", response.data.token);

            setToken(response.data.token);
            setEmail(response.data.user.email);

        } catch (error) {
            console.error("Login error:", error);

            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const currentToken = localStorage.getItem("token");

            if (!currentToken) {
                console.log("No token found");
                return;
            }

            const response = await axios.get(
                `${API_URL}/api/courses`,
                {
                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    }
                }
            );

            console.log("Courses API response:", response.data);
            setCourses(response.data.courses || []);

        } catch (error) {
            console.error("Course loading error:", error);

            if (error.response) {
                console.error(
                    "Server response:",
                    error.response.data
                );
            }

            if (error.response?.status === 401) {
                handleLogout();
            }
        }
    };
const fetchQuizzes = async () => {
    try {
        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
            return;
        }

        const response = await axios.get(
            `${API_URL}/api/quizzes`,
            {
                headers: {
                    Authorization: `Bearer ${currentToken}`
                }
            }
        );

        console.log("Quizzes API response:", response.data);

        setQuizzes(response.data.quizzes || []);

    } catch (error) {
        console.error("Quiz loading error:", error);

        if (error.response?.status === 401 ||
            error.response?.status === 403) {
            handleLogout();
        }
    }
};
const fetchResults = async () => {
    try {
        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
            return;
        }

        const response = await axios.get(
            `${API_URL}/api/quizzes/1/results`,
            {
                headers: {
                    Authorization: `Bearer ${currentToken}`
                }
            }
        );

        console.log("Results API response:", response.data);

        setQuizResults(response.data.results || []);

    } catch (error) {
        console.error("Results loading error:", error);

        if (
            error.response?.status === 401 ||
            error.response?.status === 403
        ) {
            handleLogout();
        }
    }
};
const fetchSubscription = async () => {
    try {
        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
            return;
        }

        const response = await axios.get(
            `${API_URL}/api/subscriptions`,
            {
                headers: {
                    Authorization: `Bearer ${currentToken}`
                }
            }
        );

        console.log(
            "Subscription API response:",
            response.data
        );

        setSubscription(response.data.subscription || null);

    } catch (error) {
        console.error(
            "Subscription loading error:",
            error
        );

        if (
            error.response?.status === 401 ||
            error.response?.status === 403
        ) {
            handleLogout();
        }
    }
};
    const handleLogout = () => {
        localStorage.removeItem("token");

        setToken(null);
        setCourses([]);
        setSelectedCourse(null);
        setEmail("");
        setPassword("");
        setPage("dashboard");
    };

    const openCourse = (course) => {
        setSelectedCourse(course);
        setPage("course-details");
    };
const openQuiz = async (quiz) => {
    try {
        const currentToken = localStorage.getItem("token");

        const response = await axios.get(
            `${API_URL}/api/quizzes/${quiz.id}/questions`,
            {
                headers: {
                    Authorization: `Bearer ${currentToken}`
                }
            }
        );

        console.log(
            "Questions API response:",
            response.data
        );

        setSelectedQuiz(quiz);
        setQuizQuestions(response.data.questions || []);
        setPage("quiz-details");

    } catch (error) {
        console.error("Question loading error:", error);
    }
};
const fetchAssignments = async () => {
    try {
        const currentToken = localStorage.getItem("token");

        if (!currentToken) return;

        const response = await axios.get(
            `${API_URL}/api/assignments`,
            {
                headers: {
                    Authorization: `Bearer ${currentToken}`
                }
            }
        );

        console.log("Assignments:", response.data);

        setAssignments(response.data.assignments || []);

    } catch (error) {
        console.error("Assignments loading error:", error);
    }
};
    // LOGIN
    if (!token) {
        return (
            <div className="login-container">

                <div className="login-card">

                    <h1>Cloud LMS</h1>

                    <p className="subtitle">
                        Learning Management System
                    </p>

                    <form onSubmit={handleLogin}>

                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />

                        <button type="submit">
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </button>

                    </form>

                    {message && (
                        <p className="error-message">
                            {message}
                        </p>
                    )}

                </div>

            </div>
        );
    }

    // DASHBOARD PAGE
    const DashboardPage = () => (
        <>
            <div className="welcome">
                <h2>Welcome back! 👋</h2>

                <p>
                    Manage your courses and learning
                    activities from here.
                </p>
            </div>

            <div className="stats">

                <div className="stat-card">
                    <span>Courses</span>
                    <strong>{courses.length}</strong>
                </div>

                <div className="stat-card">
                    <span>Quizzes</span>
                    <strong>1</strong>
                </div>

                <div className="stat-card">
                    <span>Subscription</span>
                    <strong>Active</strong>
                </div>

            </div>

            <section className="courses-section">

                <div className="section-header">

                    <h2>Your Courses</h2>

                    <p>
                        Courses available in your tenant
                    </p>

                </div>

                <div className="course-grid">

                    {courses.map((course) => (

                        <div
                            className="course-card"
                            key={course.id}
                        >

                            <div className="course-icon">
                                📚
                            </div>

                            <h3>
                                {course.title}
                            </h3>

                            <p>
                                {course.description ||
                                    "No description available."}
                            </p>

                            <button
                                className="view-button"
                                onClick={() =>
                                    openCourse(course)
                                }
                            >
                                View Course
                            </button>

                        </div>

                    ))}

                </div>

            </section>
        </>
    );

    // COURSES PAGE
    const CoursesPage = () => (
        <section>

            <div className="page-heading">

                <div>
                    <h2>Courses</h2>

                    <p>
                        Browse all courses available
                        in your tenant.
                    </p>
                </div>

            </div>

            {courses.length === 0 ? (

                <div className="empty-state">

                    <h3>No courses available</h3>

                    <p>
                        There are currently no courses
                        in your tenant.
                    </p>

                </div>

            ) : (

                <div className="course-grid">

                    {courses.map((course) => (

                        <div
                            className="course-card"
                            key={course.id}
                        >

                            <div className="course-icon">
                                📚
                            </div>

                            <h3>
                                {course.title}
                            </h3>

                            <p>
                                {course.description ||
                                    "No description available."}
                            </p>

                            <button
                                className="view-button"
                                onClick={() =>
                                    openCourse(course)
                                }
                            >
                                View Details
                            </button>

                        </div>

                    ))}

                </div>

            )}

        </section>
    );
const QuizzesPage = () => (
    <section>

        <div className="page-heading">

            <div>
                <h2>Quizzes</h2>

                <p>
                    Quizzes available for your courses.
                </p>
            </div>

        </div>

        {quizzes.length === 0 ? (

            <div className="empty-state">

                <h3>No quizzes available</h3>

                <p>
                    There are currently no quizzes
                    available.
                </p>

            </div>

        ) : (

            <div className="quiz-grid">

                {quizzes.map((quiz) => (

                    <div
                        className="quiz-card"
                        key={quiz.id}
                    >

                        <div className="quiz-icon">
                            📝
                        </div>

                        <h3>
                            {quiz.title}
                        </h3>

                        <p>
                            Course ID: {quiz.course_id}
                        </p>

                        <p>
                            Maximum attempts:{" "}
                            {quiz.max_attempts}
                        </p>

                        <button
                            className="view-button"
                            onClick={() => openQuiz(quiz)}
                        >
                            View Quiz
                        </button>

                    </div>

                ))}

            </div>

        )}

    </section>
);
const QuizDetailsPage = () => {

    if (!selectedQuiz) {
        return (
            <div className="empty-state">
                <h3>Quiz not found</h3>
            </div>
        );
    }

    return (
        <section>

            <button
                className="back-button"
                onClick={() => setPage("quizzes")}
            >
                ← Back to Quizzes
            </button>

            <div className="quiz-details-card">

                <div className="large-quiz-icon">
                    📝
                </div>

                <h2>
                    {selectedQuiz.title}
                </h2>

                <p className="quiz-description">
                    Quiz for Course ID{" "}
                    {selectedQuiz.course_id}
                </p>

                <div className="quiz-info-grid">

                    <div className="info-box">

                        <span>Quiz ID</span>

                        <strong>
                            {selectedQuiz.id}
                        </strong>

                    </div>

                    <div className="info-box">

                        <span>Maximum Attempts</span>

                        <strong>
                            {selectedQuiz.max_attempts}
                        </strong>

                    </div>

                </div>

                <div className="questions-section">

                    <h3>Questions</h3>

                    {quizQuestions.length === 0 ? (

                        <p>
                            No questions available.
                        </p>

                    ) : (

                        quizQuestions.map(
                            (question, index) => (

                                <div
                                    className="question-card"
                                    key={question.id}
                                >

                                    <span>
                                        Question {index + 1}
                                    </span>

                                    <h4>
                                        {question.question_text}
                                    </h4>

                                </div>

                            )
                        )

                    )}

                </div>

            </div>

        </section>
    );
};
const ResultsPage = () => (
    <section>

        <div className="page-heading">

            <div>
                <h2>Results</h2>

                <p>
                    View your quiz results and scores.
                </p>
            </div>

        </div>

        {quizResults.length === 0 ? (

            <div className="empty-state">

                <h3>No results available</h3>

                <p>
                    You have not completed any quizzes yet.
                </p>

            </div>

        ) : (

            <div className="results-grid">

                {quizResults.map((result) => (

                    <div
                        className="result-card"
                        key={result.id}
                    >

                        <div className="result-icon">
                            🏆
                        </div>

                        <h3>
                            Cloud Computing Quiz 1
                        </h3>

                        <div className="result-info">

                            <div>
                                <span>Result ID</span>

                                <strong>
                                    {result.id}
                                </strong>
                            </div>

                            <div>
                                <span>Quiz ID</span>

                                <strong>
                                    {result.quiz_id}
                                </strong>
                            </div>

                            <div>
                                <span>User ID</span>

                                <strong>
                                    {result.user_id}
                                </strong>
                            </div>

                            <div>
                                <span>Score</span>

                                <strong>
                                    {result.score}
                                </strong>
                            </div>

                        </div>

                    </div>

                ))}

            </div>

        )}

    </section>
);
const SubscriptionPage = () => {

    if (!subscription) {
        return (
            <div className="empty-state">
                <h3>No subscription found</h3>
                <p>
                    No subscription is currently associated
                    with this tenant.
                </p>
            </div>
        );
    }

    const isActive =
        subscription.status?.toUpperCase() === "ACTIVE";

    return (
        <section>

            <div className="page-heading">

                <div>
                    <h2>Subscription</h2>

                    <p>
                        Manage your organization's
                        LMS subscription.
                    </p>
                </div>

            </div>

            <div className="subscription-card">

                <div className="subscription-icon">
                    💳
                </div>

                <h3>
                    {subscription.plan}
                </h3>

                <div
                    className={
                        isActive
                            ? "status-badge active"
                            : "status-badge cancelled"
                    }
                >
                    {subscription.status}
                </div>

                <div className="subscription-info">

                    <div className="info-box">

                        <span>Subscription ID</span>

                        <strong>
                            {subscription.id}
                        </strong>

                    </div>

                    <div className="info-box">

                        <span>Tenant ID</span>

                        <strong>
                            {subscription.tenant_id}
                        </strong>

                    </div>

                    <div className="info-box">

                        <span>Plan</span>

                        <strong>
                            {subscription.plan}
                        </strong>

                    </div>

                    <div className="info-box">

                        <span>Status</span>

                        <strong>
                            {subscription.status}
                        </strong>

                    </div>

                </div>

                <div className="subscription-description">

                    {isActive ? (
                        <p>
                            Your subscription is currently
                            active and your organization can
                            use the LMS services.
                        </p>
                    ) : (
                        <p>
                            Your subscription is currently
                            cancelled.
                        </p>
                    )}

                </div>

            </div>

        </section>
    );
};
const AssignmentsPage = () => {

    return (
        <section>

            <div className="page-heading">
                <div>
                    <h2>Assignments</h2>
                    <p>
                        View and complete your course assignments.
                    </p>
                </div>
            </div>

            {assignments.length === 0 ? (

                <div className="empty-state">
                    <h3>No assignments available</h3>
                    <p>
                        There are currently no assignments.
                    </p>
                </div>

            ) : (

                <div className="assignments-grid">

                    {assignments.map((assignment) => (

                        <div
                            className="assignment-card"
                            key={assignment.id}
                        >

                            <div className="assignment-icon">
                                📝
                            </div>

                            <h3>
                                {assignment.title}
                            </h3>

                            <p>
                                {assignment.description}
                            </p>

                            <div className="assignment-meta">

                                <span>
                                    Course ID: {assignment.course_id}
                                </span>

                                <span>
                                    Due: {
                                        assignment.due_date
                                            ? assignment.due_date
                                            : "No due date"
                                    }
                                </span>

                            </div>

                            <button
                                className="primary-button"
                                onClick={async () => {
                                    await fetchAssignmentDetails(assignment.id);
                                    setPage("assignment-details");
                                }}
                            >
                                View Assignment
                            </button>

                        </div>

                    ))}

                </div>

            )}

        </section>
    );
};
const fetchAssignmentDetails = async (id) => {

    try {

        const currentToken =
            localStorage.getItem("token");

        const response = await axios.get(
            `${API_URL}/api/assignments/${id}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${currentToken}`
                }
            }
        );

        console.log(
            "Assignment details:",
            response.data
        );

        setSelectedAssignment(
            response.data.assignment ||
            response.data
        );

    } catch (error) {

        console.error(
            "Assignment details error:",
            error
        );

    }
};
const AssignmentDetailsPage = () => {

    if (
        !selectedAssignment ||
        typeof selectedAssignment !== "object"
    ) {
        return (
            <div className="empty-state">
                <h3>Assignment not found</h3>
            </div>
        );
    }

    return (
        <section>

            <button
                className="back-button"
                onClick={() => setPage("assignments")}
            >
                ← Back to Assignments
            </button>

            <div className="assignment-details-card">

                <div className="assignment-icon">
                    📝
                </div>

                <h2>
                    {selectedAssignment.title}
                </h2>

                <p className="assignment-description">
                    {selectedAssignment.description}
                </p>

                <div className="assignment-detail-info">

                    <div>
                        <span>Assignment ID</span>
                        <strong>
                            {selectedAssignment.id}
                        </strong>
                    </div>

                    <div>
                        <span>Course ID</span>
                        <strong>
                            {selectedAssignment.course_id}
                        </strong>
                    </div>

                    <div>
                        <span>Due Date</span>
                        <strong>
                            {
                                selectedAssignment.due_date
                                    ? selectedAssignment.due_date
                                    : "No due date"
                            }
                        </strong>
                    </div>

                </div>

            </div>

        </section>
    );
};
    // COURSE DETAILS PAGE
    const CourseDetailsPage = () => {

        if (!selectedCourse) {
            return (
                <div className="empty-state">
                    <h3>Course not found</h3>
                </div>
            );
        }

        return (
            <section>

                <button
                    className="back-button"
                    onClick={() => setPage("courses")}
                >
                    ← Back to Courses
                </button>

                <div className="course-details-card">

                    <div className="large-course-icon">
                        📚
                    </div>

                    <h2>
                        {selectedCourse.title}
                    </h2>

                    <p className="course-description">
                        {selectedCourse.description ||
                            "No description available."}
                    </p>

                    <div className="course-info-grid">

                        <div className="info-box">

                            <span>Course ID</span>

                            <strong>
                                {selectedCourse.id}
                            </strong>

                        </div>

                        <div className="info-box">

                            <span>Tenant</span>

                            <strong>
                                {selectedCourse.tenant_id}
                            </strong>

                        </div>

                    </div>

                    <div className="course-overview">

                        <h3>Course Overview</h3>

                        <p>
                            This course is available
                            within your organization's
                            learning environment.
                        </p>

                        <p>
                            Course content, learning
                            materials, assignments and
                            quizzes can be accessed
                            through the LMS.
                        </p>

                    </div>

                </div>

            </section>
        );
    };

    return (
        <div className="dashboard">

            {/* TOP BAR */}

            <header className="topbar">

                <div>

                    <h1>Cloud LMS</h1>

                    <span>
                        SaaS Learning Management System
                    </span>

                </div>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </header>


            <div className="dashboard-layout">

                {/* SIDEBAR */}

                <aside className="sidebar">

                    <div className="user-section">

                        <div className="avatar">
                            A
                        </div>

                        <div>

                            <strong>Admin</strong>

                            <small>
                                {email || "admin@abc.com"}
                            </small>

                        </div>

                    </div>


                    <nav>

                        <button
                            className={
                                page === "dashboard"
                                    ? "nav-active"
                                    : ""
                            }
                            onClick={() =>
                                setPage("dashboard")
                            }
                        >
                            Dashboard
                        </button>


                        <button
                            className={
                                page === "courses" ||
                                page === "course-details"
                                    ? "nav-active"
                                    : ""
                            }
                            onClick={() => {
                                setPage("courses");
                                setSelectedCourse(null);
                            }}
                        >
                            Courses
                        </button>


                        <button
    className={
        page === "quizzes" ||
        page === "quiz-details"
            ? "nav-active"
            : ""
    }
    onClick={() => {
        setPage("quizzes");
        setSelectedQuiz(null);
    }}
>
    Quizzes
</button>


                        <button
                            className={
                                page === "results"
                                    ? "nav-active"
                                    : ""
                            }
                            onClick={() => setPage("results")}
                        >
                            Results
                        </button>


                        <button
    className={
        page === "subscription"
            ? "nav-active"
            : ""
    }
    onClick={() => setPage("subscription")}
>
    Subscription
</button>
<button
    className={
        page === "assignments"
            ? "nav-active"
            : ""
    }
    onClick={() => setPage("assignments")}
>
    Assignments
</button>
                    </nav>

                </aside>


                {/* MAIN CONTENT */}

                <main className="main-content">

                    {page === "dashboard" && (
                        <DashboardPage />
                    )}

                    {page === "courses" && (
                        <CoursesPage />
                    )}

                    {page === "course-details" && (
                        <CourseDetailsPage />
                    )}
{page === "quizzes" && (
    <QuizzesPage />
)}

{page === "quiz-details" && (
    <QuizDetailsPage />
)}
{page === "results" && (
    <ResultsPage />
)}
{page === "subscription" && (
    <SubscriptionPage />
)}
{page === "assignments" && (
    <AssignmentsPage />
)}

{page === "assignment-details" && (
    <AssignmentDetailsPage />
)}
                </main>

            </div>

        </div>
    );
}

export default App;