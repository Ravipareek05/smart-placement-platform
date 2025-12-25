import ThemeToggle from "./components/ThemeToggle";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen grid place-items-center
        bg-gradient-to-br
        from-gray-100 via-gray-200 to-gray-100
        dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
      "
    >
        {/* 🌗 ADD THIS LINE */}
    <ThemeToggle />
      <div
        className="
          w-full max-w-md rounded-2xl p-8 shadow-2xl
          bg-white dark:bg-white/5
          backdrop-blur-xl
          border border-gray-200 dark:border-white/10
        "
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-6">
          Create Account
        </h1>

        {error && (
          <p className="text-red-500 dark:text-red-400 text-sm text-center mb-4">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <input
            className="
              w-full rounded-xl px-4 py-3
              bg-gray-100 dark:bg-slate-900
              text-gray-800 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              border border-gray-300 dark:border-white/10
              focus:ring-2 focus:ring-green-500 outline-none
            "
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="
              w-full rounded-xl px-4 py-3
              bg-gray-100 dark:bg-slate-900
              text-gray-800 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              border border-gray-300 dark:border-white/10
              focus:ring-2 focus:ring-green-500 outline-none
            "
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="
              w-full rounded-xl px-4 py-3
              bg-gray-100 dark:bg-slate-900
              text-gray-800 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              border border-gray-300 dark:border-white/10
              focus:ring-2 focus:ring-green-500 outline-none
            "
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading || !name || !email || !password}
          className="
            mt-6 w-full rounded-xl py-3 font-semibold
            bg-green-600 hover:bg-green-700
            text-white transition
            disabled:opacity-50
          "
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}