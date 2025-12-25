import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { v4 as uuid } from "uuid";

export function runJavaScript(code, input) {
  return new Promise((resolve) => {
    const jobId = uuid();
    const filePath = path.join("/tmp", `${jobId}.js`);

    // Wrap user code safely
    const wrappedCode = `
${code}

try {
  const result = solve(${input});
  console.log(result);
} catch (e) {
  console.error("Runtime Error:", e.message);
}
`;

    fs.writeFileSync(filePath, wrappedCode);

    exec(`node ${filePath}`, { timeout: 2000 }, (err, stdout, stderr) => {
      fs.unlinkSync(filePath);

      if (err) {
        resolve({ error: "Execution timed out or failed" });
      } else if (stderr) {
        resolve({ error: stderr });
      } else {
        resolve({ output: stdout.trim() });
      }
    });
  });
}