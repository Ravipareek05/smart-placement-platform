import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
  onClick={toggleTheme}
  className="
    fixed top-6 right-6 z-50
    w-10 h-10 rounded-full
    bg-white dark:bg-slate-800
    border border-gray-200 dark:border-white/10
    shadow-lg
    flex items-center justify-center
    text-xl
    hover:scale-110 active:scale-95
    transition-transform duration-300
  "
>
  <span className="transition-transform duration-300">
    {theme === "dark" ? "☀️" : "🌙"}
  </span>
</button>
  );
}