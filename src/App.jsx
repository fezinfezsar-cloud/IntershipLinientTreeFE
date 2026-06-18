import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom";

import "./App.css";

import heroImage from "./assets/hero.png";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";

const API_BASE =
  import.meta.env.VITE_PUBLIC_API_BASE ||
  "/habits";
/* =========================
   REUSABLE COMPONENTS
========================= */

function Spinner() {
  return <div className="spinner"></div>;
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  );
}

/* =========================
   ALL HABITS PAGE
========================= */

function AllHabitsPage({ showToast }) {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchHabits = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();

      setHabits(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to fetch habits", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const deleteHabit = async (id) => {
    if (!window.confirm("Delete this habit?")) return;

    try {
      await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });

      showToast("Habit deleted", "success");

      fetchHabits();
    } catch {
      showToast("Failed to delete habit", "error");
    }
  };

  if (loading) {
    return (
      <div className="center-box">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Habit Tracker Dashboard
          </h1>

          <p className="page-subtitle">
            Manage and track your daily habits
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/create")}
        >
          + Create Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <h2>No Habits Found</h2>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Habit</th>
                <th>Category</th>
                <th>Frequency</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {habits.map((habit) => (
                <tr key={habit.id}>
                  <td>{habit.id}</td>

                  <td>{habit.habit_name}</td>

                  <td>{habit.category}</td>

                  <td>{habit.frequency}</td>

                  <td>
                    <span
                      className={
                        habit.status === "Completed"
                          ? "status-completed"
                          : "status-pending"
                      }
                    >
                      {habit.status}
                    </span>
                  </td>

                  <td>
                    <div className="action-group">
                      <button
                        className="btn btn-sm"
                        onClick={() =>
                          navigate(`/habit/${habit.id}`)
                        }
                      >
                        View
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          navigate(`/edit/${habit.id}`)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          deleteHabit(habit.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* =========================
   VIEW HABIT
========================= */

function ViewHabitPage({ showToast }) {
  const { id } = useParams();

  const navigate = useNavigate();

  const [habit, setHabit] = useState(null);

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const res = await fetch(`${API_BASE}/${id}`);
        const data = await res.json();

        setHabit(data);
      } catch {
        showToast("Failed to fetch habit", "error");
      }
    };

    fetchHabit();
  }, [id]);

  const markCompleted = async () => {
    try {
      await fetch(`${API_BASE}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          status: "Completed",
        }),
      });

      setHabit({
        ...habit,
        status: "Completed",
      });

      showToast(
        "Habit marked completed",
        "success"
      );
    } catch {
      showToast(
        "Failed to update status",
        "error"
      );
    }
  };

  if (!habit)
    return (
      <div className="center-box">
        <Spinner />
      </div>
    );

  return (
    <div className="page">
      <button
        className="btn btn-secondary"
        onClick={() => navigate("/")}
      >
        ← Back
      </button>

      <h1 className="page-title">
        Habit Details
      </h1>

      <div className="card detail-card">
        <div className="detail-row">
          <strong>Name:</strong>
          <span>{habit.habit_name}</span>
        </div>

        <div className="detail-row">
          <strong>Category:</strong>
          <span>{habit.category}</span>
        </div>

        <div className="detail-row">
          <strong>Frequency:</strong>
          <span>{habit.frequency}</span>
        </div>

        <div className="detail-row">
          <strong>Status:</strong>
          <span>{habit.status}</span>
        </div>

        {habit.status !== "Completed" && (
          <button
            className="btn btn-primary"
            onClick={markCompleted}
          >
            Mark Completed
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================
   CREATE HABIT
========================= */

function CreateHabitPage({ showToast }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    habit_name: "",
    category: "",
    frequency: "Daily",
    start_date: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(form),
      });

      showToast(
        "Habit created successfully",
        "success"
      );

      navigate("/");
    } catch {
      showToast(
        "Failed to create habit",
        "error"
      );
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">
        Create Habit
      </h1>

      <div className="card form-card">
        <form
          className="form"
          onSubmit={handleSubmit}
        >
          <input
            className="form-input"
            placeholder="Habit Name"
            required
            value={form.habit_name}
            onChange={(e) =>
              setForm({
                ...form,
                habit_name:
                  e.target.value,
              })
            }
          />

          <input
            className="form-input"
            placeholder="Category"
            required
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category:
                  e.target.value,
              })
            }
          />

          <select
            className="form-input"
            value={form.frequency}
            onChange={(e) =>
              setForm({
                ...form,
                frequency:
                  e.target.value,
              })
            }
          >
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>

          <input
            className="form-input"
            type="date"
            value={form.start_date}
            onChange={(e) =>
              setForm({
                ...form,
                start_date:
                  e.target.value,
              })
            }
          />

          <button
            className="btn btn-primary"
            type="submit"
          >
            Create Habit
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================
   EDIT HABIT
========================= */

function EditHabitPage({ showToast }) {
  const { id } = useParams();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    habit_name: "",
    category: "",
    frequency: "",
  });

  useEffect(() => {
    const loadHabit = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/${id}`
        );

        const data =
          await res.json();

        setForm({
          habit_name:
            data.habit_name || "",
          category:
            data.category || "",
          frequency:
            data.frequency || "",
        });
      } catch {
        showToast(
          "Failed to load habit",
          "error"
        );
      }
    };

    loadHabit();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(form),
      });

      showToast(
        "Habit updated",
        "success"
      );

      navigate("/");
    } catch {
      showToast(
        "Failed to update habit",
        "error"
      );
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">
        Edit Habit
      </h1>

      <div className="card form-card">
        <form
          className="form"
          onSubmit={handleSubmit}
        >
          <input
            className="form-input"
            value={form.habit_name}
            onChange={(e) =>
              setForm({
                ...form,
                habit_name:
                  e.target.value,
              })
            }
          />

          <input
            className="form-input"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category:
                  e.target.value,
              })
            }
          />

          <select
            className="form-input"
            value={form.frequency}
            onChange={(e) =>
              setForm({
                ...form,
                frequency:
                  e.target.value,
              })
            }
          >
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>

          <button
            className="btn btn-primary"
            type="submit"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================
   APP ROOT
========================= */

function App() {
  const [toast, setToast] =
    useState(null);

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({ message, type });
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <img
              src={heroImage}
              alt="Hero"
              className="hero-logo"
            />

            <h2 className="brand-name">
              Habit Tracker
            </h2>
          </div>

          <div className="logo-container">
            <img
              src={viteLogo}
              alt="Vite"
              className="tech-logo"
            />

            <img
              src={reactLogo}
              alt="React"
              className="tech-logo react-logo"
            />
          </div>

          <nav className="sidebar-nav">
            <NavLink
              to="/"
              className="nav-link"
            >
              📋 All Habits
            </NavLink>

            <NavLink
              to="/create"
              className="nav-link"
            >
              ➕ Create Habit
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <div className="dashboard-hero">
            <div>
              <h1>
                Build Better Habits
              </h1>

              <p>
                Track your progress,
                stay consistent and
                achieve your goals.
              </p>
            </div>

            <img
              src={heroImage}
              alt="Hero Banner"
              className="hero-banner"
            />
          </div>

          <Routes>
            <Route
              path="/"
              element={
                <AllHabitsPage
                  showToast={showToast}
                />
              }
            />

            <Route
              path="/habit/:id"
              element={
                <ViewHabitPage
                  showToast={showToast}
                />
              }
            />

            <Route
              path="/create"
              element={
                <CreateHabitPage
                  showToast={showToast}
                />
              }
            />

            <Route
              path="/edit/:id"
              element={
                <EditHabitPage
                  showToast={showToast}
                />
              }
            />
          </Routes>

          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() =>
                setToast(null)
              }
            />
          )}
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;