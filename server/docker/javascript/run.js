const fs = require("fs");

const input = JSON.parse(fs.readFileSync(0, "utf8"));

let output = null;

// USER CODE WILL BE INJECTED HERE
// solve(input) must exist
try {
  eval(input.code);
  output = solve(input.testCase);
  console.log(String(output));
} catch (err) {
  console.log("ERROR:", err.message);
}