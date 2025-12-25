import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Editor from "@monaco-editor/react";

const boilerplate = {
  javascript: `function solve(input) {
  // input is already parsed
  return input.reduce((a,b)=>a+b,0);
}`,
  cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    vector<int> a;
    int x;
    while(cin >> x) a.push_back(x);
    cout << accumulate(a.begin(), a.end(), 0);
    return 0;
}`,
  python: `import sys
nums = list(map(int, sys.stdin.read().split()))
print(sum(nums))`,
  java: `import java.util.*;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int sum = 0;
    while(sc.hasNextInt()) sum += sc.nextInt();
    System.out.print(sum);
  }
}`
};

export default function SolveProblem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(boilerplate.javascript);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const testCases = [
    { input: "1 2 3", expected: "6" },
    { input: "5 5 5", expected: "15" }
  ];

  /* FETCH PROBLEM */
  useEffect(() => {
    fetch(`http://localhost:5001/problems/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setProblem);
  }, [id, token]);

  /* CHANGE LANGUAGE */
  const changeLanguage = (lang) => {
    setLanguage(lang);
    setCode(boilerplate[lang]);
    setResults(null);
    setError("");
  };

  /* RUN CODE */
  const runCode = async () => {
    setRunning(true);
    setResults(null);
    setError("");

    try {
      const res = await fetch("http://localhost:5001/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ language, code, testCases }),
      });

      const data = await res.json();
      if (!data.success) setError(data.error);
      else setResults(data.results);
    } catch {
      setError("Execution failed");
    } finally {
      setRunning(false);
    }
  };

  /* SUBMIT */
  const submitSolution = async () => {
    if (!results || results.some(r => !r.passed)) {
      alert("All test cases must pass");
      return;
    }

    await fetch(`http://localhost:5001/problems/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "Solved" }),
    });

    navigate("/problems");
  };

  if (!problem) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <p className="text-center mt-20">Loading problem...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={() => navigate("/problems")} className="text-blue-400 mb-4">
          ← Back to Problems
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT */}
          <div className="bg-slate-800/70 rounded-2xl p-6 border border-white/10">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <p className="text-gray-400">{problem.topic} • {problem.difficulty}</p>

            <h3 className="mt-6 font-semibold">Test Cases</h3>
            {testCases.map((t,i)=>(
              <div key={i} className="bg-slate-900/60 p-2 rounded text-xs mt-2">
                Input: {t.input} → Expected: {t.expected}
              </div>
            ))}
          </div>

          {/* RIGHT */}
          <div className="bg-slate-800/70 rounded-2xl p-4 border border-white/10 flex flex-col">
            <div className="flex justify-between mb-2">
              <span>Language</span>
              <select
                value={language}
                onChange={e=>changeLanguage(e.target.value)}
                className="bg-slate-900 px-3 py-1 rounded"
              >
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
            </div>

            <div className="h-[420px] border border-white/10 rounded overflow-hidden">
              <Editor
                theme="vs-dark"
                language={language === "cpp" ? "cpp" : language}
                value={code}
                onChange={v => setCode(v)}
                options={{ fontSize: 14, minimap: { enabled: false } }}
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={runCode} disabled={running}
                className="px-5 py-2 bg-blue-600 rounded">
                ▶ Run
              </button>
              <button onClick={submitSolution}
                className="px-5 py-2 bg-green-600 rounded">
                ✅ Submit
              </button>
            </div>

            <div className="mt-4">
              {error && <pre className="text-red-400">{error}</pre>}
              {results && results.map((r,i)=>(
                <div key={i}
                  className={`p-2 text-sm rounded mt-1 ${
                    r.passed ? "bg-green-900/30" : "bg-red-900/30"
                  }`}>
                  Input {r.input} → Output {r.output}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}