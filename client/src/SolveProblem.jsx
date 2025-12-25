import { useState } from "react";
import Editor from "@monaco-editor/react";
import Navbar from "./Navbar";

export default function SolveProblem() {
  const [code, setCode] = useState(
`function solve(input) {
  // write your code here
  return input;
}`
  );
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("http://localhost:5001/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          code,
          input: "5",
        }),
      });

      const data = await res.json();
      setOutput(data.output || data.error);
    } catch {
      setOutput("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Code Editor */}
        <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border">
          <div className="p-3 font-semibold text-gray-700 dark:text-gray-300">
            Code Editor (JavaScript)
          </div>

          <Editor
            height="400px"
            language="javascript"
            theme="vs-dark"
            value={code}
            onChange={setCode}
          />
        </div>

        {/* Output Panel */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border">
          <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Output
          </h3>

          <pre className="bg-black text-green-400 p-4 rounded text-sm min-h-[300px]">
            {loading ? "Running..." : output || "No output yet"}
          </pre>

          <button
            onClick={runCode}
            className="mt-4 px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            ▶ Run Code
          </button>
        </div>
      </div>
    </div>
  );
}