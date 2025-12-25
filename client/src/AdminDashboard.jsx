import Navbar from "./Navbar";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Admin Dashboard 👑
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Manage users and problems.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminCard title="Users" desc="View all registered users" />
          <AdminCard title="Problems" desc="View all problems" />
        </div>
      </div>
    </div>
  );
}

function AdminCard({ title, desc }) {
  return (
    <div className="
      bg-white dark:bg-slate-800
      border border-gray-200 dark:border-white/10
      rounded-xl p-5 shadow
    ">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
        {desc}
      </p>
    </div>
  );
}