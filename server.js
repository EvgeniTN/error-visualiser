const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");
const app = express();
const port = 3003;

app.use(cors());

app.get("/run-python", (req, res) => {
	const pythonScriptPath = "/Users/evgeninikolov/Developer/test/main.py";
	const pythonProcess = spawn("python3", [pythonScriptPath]);

	let errors = [];

	pythonProcess.stderr.on("data", (data) => {
		errors.push(data.toString());
	});

	pythonProcess.on("close", (code) => {
		if (code !== 0) {
			res.json({ errors });
		} else {
			res.json({ errors: [] });
		}
	});

	pythonProcess.on("error", (err) => {
		res.status(500).json({ error: err.message });
	});
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
