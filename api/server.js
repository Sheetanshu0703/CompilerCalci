const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Path to the executable
const executablePath = path.join(__dirname, "../backend/calc.exe");

// Check if executable exists
if (!fs.existsSync(executablePath)) {
  console.error(`Error: Executable not found at ${executablePath}`);
  process.exit(1);
}

app.post("/evaluate", (req, res) => {
  const { expression } = req.body;

  if (!expression) {
    return res.status(400).json({ error: "Expression is required" });
  }

  console.log(`Received expression: ${expression}`);

  const child = spawn(executablePath);

  let output = "";
  let errorOutput = "";

  child.stdout.on("data", (data) => {
    output += data.toString();
  });

  child.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  child.on("error", (error) => {
    console.error(`Failed to start process: ${error.message}`);
    return res.status(500).json({ error: "Failed to start evaluation process" });
  });

  child.on("close", (code) => {
    if (code !== 0) {
      console.error(`Process exited with code ${code}, stderr: ${errorOutput}`);
      return res.status(500).json({ error: "Error evaluating expression", details: errorOutput.trim() });
    }

    // Try to parse the output as JSON
    let responseJson;
    try {
      // Find the first { ... } JSON object in the output
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        responseJson = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in output");
      }
    } catch (err) {
      console.error(`Failed to parse output: ${err.message}`);
      console.error(`Raw output: ${output}`);
      return res.status(500).json({ error: "Failed to parse backend output as JSON", details: output.trim() });
    }

    res.json(responseJson);
  });

  // Send expression to the executable's stdin and close input stream
  child.stdin.write(expression + "\n");
  child.stdin.end();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
