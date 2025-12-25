import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    fetch("http://localhost:5001/problems", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        setProblems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setProblems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, navigate]);

  const total = problems.length;
  const solved = problems.filter((p) => p.status === "Solved").length;
  const completion =
    total === 0 ? "0%" : `${Math.round((solved / total) * 100)}%`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          Dashboard
        </h2>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">
            Loading stats...
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Problems" value={total} />
            <StatCard title="Solved" value={solved} />
            <StatCard title="Completion" value={completion} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        {title}
      </p>
      <h3 className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
        {value}
      </h3>
    </div>
  );
}