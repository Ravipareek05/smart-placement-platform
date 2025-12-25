import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // ✅ decode role safely
  let role = "USER";
  try {
    if (token) role = jwtDecode(token).role;
  } catch {}

  /* ---------- FETCH PROBLEMS ---------- */
  const fetchProblems = async () => {
    try {
      const res = await fetch("http://localhost:5001/problems", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProblems(Array.isArray(data) ? data : []);
    } catch {
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  /* ---------- ADD PROBLEM (ADMIN ONLY) ---------- */
  const addProblem = async () => {
    if (!title || !topic) return;

    await fetch("http://localhost:5001/problems", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, topic, difficulty }),
    });

    setTitle("");
    setTopic("");
    setDifficulty("Easy");
    setShowForm(false);
    fetchProblems();
  };

  /* ---------- UPDATE STATUS ---------- */
  const toggleStatus = async (id, current) => {
    const next = current === "Solved" ? "Unsolved" : "Solved";

    await fetch(`http://localhost:5001/problems/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: next }),
    });

    fetchProblems();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <p className="p-10 text-center text-gray-400">Loading problems...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-bold">DSA Problems</h2>
            <p className="text-gray-400 mt-1">
              Practice and track your progress
            </p>
          </div>

          {role === "ADMIN" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
            >
              + Add Problem
            </button>
          )}
        </div>

        {/* ADMIN FORM */}
        {role === "ADMIN" && showForm && (
          <div className="mb-10 bg-slate-800/80 border border-white/10 rounded-2xl p-6">
            <input
              className="input mb-3"
              placeholder="Problem title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="input mb-3"
              placeholder="Topic (Array, DP, Graph...)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <select
              className="input mb-3"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>

            <button
              onClick={addProblem}
              className="px-5 py-2 bg-green-600 rounded-lg"
            >
              Save
            </button>
          </div>
        )}

        {/* PROBLEM LIST */}
        {problems.length === 0 ? (
          <p className="text-gray-400 text-center">No problems yet</p>
        ) : (
          <div className="grid gap-4">
            {problems.map((p) => (
              <div
                key={p.id}
                className="bg-slate-800/70 border border-white/10 rounded-2xl p-6 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-gray-400">
                    {p.topic} • {p.difficulty}
                  </p>
                </div>

                <div className="flex gap-3">
                  {/* SOLVE */}
                  <button
                    onClick={() => navigate(`/problems/${p.id}`)}
                    className="px-4 py-1 bg-blue-600 rounded-full text-sm"
                  >
                    Solve →
                  </button>

                  {/* STATUS */}
                  <button
                    onClick={() => toggleStatus(p.id, p.status)}
                    className={`px-4 py-1 rounded-full text-sm ${
                      p.status === "Solved"
                        ? "bg-green-600"
                        : "bg-gray-600"
                    }`}
                  >
                    {p.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}