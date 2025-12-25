import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "./prismaClient.js";
import auth from "./middleware/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- TEST ROUTE ---------------- */
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

/* ---------------- REGISTER ---------------- */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- LOGIN ---------------- */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- ADD PROBLEM (ADMIN ONLY) ---------------- */
app.post("/problems", auth, async (req, res) => {
  if (req.role !== "ADMIN") {
    return res.status(403).json({ message: "Admins only" });
  }

  try {
    const { title, topic, difficulty, status } = req.body;

    const problem = await prisma.dSAProblem.create({
      data: {
        title,
        topic,
        difficulty,
        status,
        userId: req.userId,
      },
    });

    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- GET USER PROBLEMS ---------------- */
app.get("/problems", auth, async (req, res) => {
  try {
    const problems = await prisma.dSAProblem.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});