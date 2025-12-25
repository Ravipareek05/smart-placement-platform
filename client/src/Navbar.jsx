import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token"); // 🔐 remove JWT
    navigate("/login");
  };

  return (
    <nav
      className="
        flex items-center justify-between
        px-6 py-4
        bg-white dark:bg-slate-900
        border-b border-gray-200 dark:border-white/10
      "
    >
      {/* Logo */}
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">
        Smart Placement
      </h1>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="text-gray-600 dark:text-gray-300 hover:underline"
        >
          Dashboard
        </Link>

        <Link
          to="/problems"
          className="text-gray-600 dark:text-gray-300 hover:underline"
        >
          Problems
        </Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="
            px-3 py-2 rounded-lg
            bg-gray-200 dark:bg-slate-800
            text-gray-800 dark:text-white
            hover:scale-105 transition
          "
          title="Toggle theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="
    px-4 py-2 rounded-lg
    border border-gray-300 dark:border-white/20
    text-gray-700 dark:text-gray-300
    hover:bg-gray-100 dark:hover:bg-slate-800
    transition
  "
>
          Logout
        </button>
      </div>
    </nav>
  );
}