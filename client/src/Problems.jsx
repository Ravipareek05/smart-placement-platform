import { useEffect, useState } from "react";
import Navbar from "./Navbar";

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");

  const token = localStorage.getItem("token");

  const fetchProblems = async () => {
    const res = await fetch("http://localhost:5001/problems", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProblems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const addProblem = async () => {
    await fetch("http://localhost:5001/problems", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, topic, difficulty }),
    });
    setShowForm(false);
    fetchProblems();
  };

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5001/problems/${id}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchProblems();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto text-white">
        <h2 className="text-3xl mb-4">DSA Problems</h2>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-4 px-4 py-2 bg-blue-600 rounded"
        >
          + Add Problem (Admin)
        </button>

        {showForm && (
          <div className="mb-4 space-y-2">
            <input placeholder="Title" onChange={e => setTitle(e.target.value)} />
            <input placeholder="Topic" onChange={e => setTopic(e.target.value)} />
            <button onClick={addProblem}>Save</button>
          </div>
        )}

        {problems.map(p => (
          <div key={p.id} className="bg-slate-800 p-4 rounded mb-3">
            <h3>{p.title}</h3>
            <p>{p.topic} | {p.difficulty}</p>
            <button
              onClick={() => updateStatus(p.id, p.status === "Solved" ? "Unsolved" : "Solved")}
              className="mt-2 px-3 py-1 bg-green-600 rounded"
            >
              {p.status}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}