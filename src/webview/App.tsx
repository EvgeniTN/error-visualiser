import React, { use, useState, useEffect } from "react";
import "./styles.css";
import { GoogleGenerativeAI } from "@google/generative-ai";

const App: React.FC = () => {
	const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
	const [errors, setErrors] = useState("");
	const [scriptPath, setScriptPath] = useState("");
	const [files, setFiles] = useState<{ [key: string]: string }>({});
	const [searchResults, setSearchResults] = useState([]);
	const [simplifiedError, setSimplifiedError] = useState("");

	const getFile = async () => {
		// Get the file path from the clipboard
		try {
			const filePath = await navigator.clipboard.readText();
			setScriptPath(filePath);
			if (scriptPath in files || scriptPath == "") {
				return;
			} else {
				setFiles({ ...files, [scriptPath]: `${scriptPath} file` });
			}
		} catch (error) {
			setErrors((error as Error).message);
		}
	};

	const outputErrors = async (url: string) => {
		// Fetch the errors from local server
		try {
			const response = await fetch(
				`http://localhost:3003/run-python?scriptPath=${encodeURIComponent(url)}`
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setErrors(data.errors.toString());
		} catch (error) {
			setErrors((error as Error).message);
		}
	};

	const searchStackOverflow = async (err: string) => {
		// Search StackOverflow for the error
		try {
			const response = await fetch(
				`https://api.stackexchange.com/2.3/search?order=desc&sort=activity&tagged=python&intitle=${err}&site=stackoverflow`
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setSearchResults(data.items.slice(0, 3));
		} catch (error) {
			console.error(error);
		}
	};

	async function simplifyError(err: string): Promise<string> {
		// Use Google's Generative AI to simplify the error
		if (!apiKey) {
			throw new Error(
				"API key is undefined. Please set REACT_APP_GEMINI_API_KEY."
			);
		}
		const generativeAI = new GoogleGenerativeAI(apiKey);
		const model = generativeAI.getGenerativeModel({
			model: "gemini-2.0-flash",
		});

		const prompt = `Simplify the following python error: ${err}`;

		try {
			const result = await model.generateContent(prompt);
			const response = await result.response.text();
			return response;
		} catch (error) {
			console.error(error);
			return "Failed to simplify error";
		}
	}

	const outputSimplifiedError = async () => {
		// Output the simplified error
		const simplifiedError = await simplifyError(errors);
		setSimplifiedError(simplifiedError);
	};

	return (
		<>
			<div>
				<h1>Error View</h1>
				<div className="fileList">
					<button onClick={getFile}>Get file</button>
					<ul>
						{Object.keys(files).map((file) => (
							<li className="file">
								<button onClick={() => outputErrors(file)}>
									{files[file]}
								</button>
								<button>X</button>
							</li>
						))}
					</ul>
				</div>
				<div className="errors">
					<pre>
						<code className="language-python">{errors}</code>
					</pre>
					<div className="btn-wrapper">
						<button onClick={() => searchStackOverflow(errors)}>
							Search StackOverflow
						</button>
						<button onClick={outputSimplifiedError}>Simplify error</button>
					</div>
					<pre>
						<code className="language-python">{simplifiedError}</code>
					</pre>
					<ul>
						{searchResults.map((result: any, index: number) => (
							<li key={index}>
								<a href={result.link} target="_blank" rel="noopener noreferrer">
									{result.title}
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
		</>
	);
};

export default App;
