import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

import prisma from "./prismaClient.js";
import auth from "./middleware/auth.js";
import admin from "./middleware/admin.js";

const app = express();
app.use(cors());
app.use(express.json());

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name, email, password: hashed, role: "USER" },
    });

    res.json({ message: "Registered successfully" });
  } catch {
    res.status(500).json({ message: "Registration failed" });
  }
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
});

/* ================= ADD PROBLEM (ADMIN) ================= */
app.post("/problems", auth, admin, async (req, res) => {
  try {
    const { title, topic, difficulty } = req.body;

    if (!title || !topic || !difficulty)
      return res.status(400).json({ message: "Missing fields" });

    const problem = await prisma.problem.create({
      data: {
        title,
        topic,
        difficulty,
        createdById: req.userId,
      },
    });

    res.json(problem);
  } catch {
    res.status(500).json({ message: "Failed to add problem" });
  }
});

/* ================= GET ALL PROBLEMS ================= */
app.get("/problems", auth, async (req, res) => {
  try {
    const problems = await prisma.problem.findMany({
      include: {
        users: {
          where: { userId: req.userId },
          select: { status: true },
        },
      },
      orderBy: { id: "desc" },
    });

    res.json(
      problems.map((p) => ({
        id: p.id,
        title: p.title,
        topic: p.topic,
        difficulty: p.difficulty,
        status: p.users[0]?.status || "Unsolved",
      }))
    );
  } catch {
    res.status(500).json({ message: "Failed to load problems" });
  }
});

/* ================= GET SINGLE PROBLEM ================= */
app.get("/problems/:id", auth, async (req, res) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!problem)
      return res.status(404).json({ message: "Problem not found" });

    res.json(problem);
  } catch {
    res.status(500).json({ message: "Failed to load problem" });
  }
});

/* ================= UPDATE STATUS ================= */
app.patch("/problems/:id/status", auth, async (req, res) => {
  try {
    const problemId = Number(req.params.id);
    const { status } = req.body;

    const entry = await prisma.userProblem.upsert({
      where: {
        userId_problemId: {
          userId: req.userId,
          problemId,
        },
      },
      update: { status },
      create: {
        userId: req.userId,
        problemId,
        status,
      },
    });

    res.json(entry);
  } catch {
    res.status(500).json({ message: "Failed to update status" });
  }
});

/* ================= RUN CODE (DOCKER JUDGE) ================= */
app.post("/run", auth, async (req, res) => {
  const { language, code, testCases } = req.body;

  if (!language || !code || !Array.isArray(testCases)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payload",
    });
  }

  const jobId = uuid();
  const jobDir = path.join(process.cwd(), "tmp", jobId);
  fs.mkdirSync(jobDir, { recursive: true });

  let fileName, image, compileCmd, runCmd;

  switch (language) {
    case "javascript":
      fileName = "run.js";
      image = "judge-js";
      compileCmd = "";
      runCmd = "node run.js";
      break;

    case "python":
      fileName = "run.py";
      image = "judge-python";
      compileCmd = "";
      runCmd = "python run.py";
      break;

    case "cpp":
      fileName = "run.cpp";
      image = "judge-cpp";
      compileCmd = "g++ run.cpp -o run";
      runCmd = "./run";
      break;

    case "java":
      fileName = "Main.java";
      image = "judge-java";
      compileCmd = "javac Main.java";
      runCmd = "java Main";
      break;

    default:
      return res.json({ success: false, message: "Unsupported language" });
  }

  fs.writeFileSync(path.join(jobDir, fileName), code);

  try {
    const results = [];

    for (const t of testCases) {
      fs.writeFileSync(path.join(jobDir, "input.txt"), t.input);

      const cmd = `
docker run --rm \
-v ${jobDir}:/app \
-w /app \
${image} \
sh -c "${compileCmd ? compileCmd + " && " : ""}cat input.txt | ${runCmd}"
      `;

      const output = await new Promise((resolve, reject) => {
        exec(cmd, { timeout: 3000 }, (err, stdout, stderr) => {
          if (err) reject(stderr || err.message);
          else resolve(stdout.trim());
        });
      });

      results.push({
        input: t.input,
        expected: String(t.expected),
        output,
        passed: output === String(t.expected),
      });
    }

    fs.rmSync(jobDir, { recursive: true, force: true });
    res.json({ success: true, results });

  } catch (err) {
    fs.rmSync(jobDir, { recursive: true, force: true });
    res.json({ success: false, error: err.toString() });
  }
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});