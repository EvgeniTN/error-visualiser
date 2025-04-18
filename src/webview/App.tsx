import React, { useState, useEffect } from "react";
import "./styles.css";
import { GoogleGenerativeAI } from "@google/generative-ai";

const App: React.FC = () => {
	const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
	const [files, setFiles] = useState<{
		[key: string]: { name: string; errors: string; simplifiedError?: string };
	}>(() => {
		const savedFiles = sessionStorage.getItem("files");
		return savedFiles ? JSON.parse(savedFiles) : {};
	});
	const [searchResults, setSearchResults] = useState<any[]>(() => {
		const savedResults = sessionStorage.getItem("searchResults");
		return savedResults ? JSON.parse(savedResults) : [];
	});
	const [selectedFile, setSelectedFile] = useState<string | null>(() => {
		return sessionStorage.getItem("selectedFile");
	});

	useEffect(() => {
		sessionStorage.setItem("files", JSON.stringify(files));
	}, [files]);

	useEffect(() => {
		sessionStorage.setItem("searchResults", JSON.stringify(searchResults));
	}, [searchResults]);

	useEffect(() => {
		if (selectedFile) {
			sessionStorage.setItem("selectedFile", selectedFile);
		} else {
			sessionStorage.removeItem("selectedFile");
		}
	}, [selectedFile]);

	useEffect(() => {
		const handleBeforeUnload = () => {
			sessionStorage.removeItem("files");
			sessionStorage.removeItem("searchResults");
			sessionStorage.removeItem("selectedFile");
		};

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, []);

	const getFile = async () => {
		// Get the file path from the clipboard
		let scriptPath = String();
		let filename = String();
		try {
			const filePath = await navigator.clipboard.readText();
			scriptPath = filePath;
			filename = scriptPath.split("/").at(-1) ?? "";
			if (
				(scriptPath in files == false || scriptPath != "") &&
				filename.split(".").at(-1) == "py"
			) {
				setFiles({
					...files,
					[scriptPath]: { name: `${filename}`, errors: "" },
				});
			}
		} catch (error) {
			console.error((error as Error).message);
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
			setFiles((prevFiles) => ({
				...prevFiles,
				[url]: { ...prevFiles[url], errors: data.errors.toString() },
			}));

			setSelectedFile(url);
		} catch (error) {
			console.error((error as Error).message);
		}
	};

	const searchStackOverflow = async (err: string) => {
		// Search StackOverflow for the error
		console.log(err.split("Error:").at(-1));
		try {
			const response = await fetch(
				`https://api.stackexchange.com/2.3/search?order=desc&sort=activity&tagged=python&intitle=${err
					.split("Error:")
					.at(-1)}&site=stackoverflow`
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			if (data.items && data.items.length > 0) {
				setSearchResults(data.items.slice(0, 3));
			} else {
				console.warn("No results found");
				setSearchResults([]);
			}
		} catch (error) {
			console.error(error);
		}
	};

	async function getArticles(err: string): Promise<string> {
		// Use Google's Generative AI to get articles
		console.log(err);
		if (!apiKey) {
			throw new Error(
				"API key is undefined. Please set REACT_APP_GEMINI_API_KEY."
			);
		}
		const generativeAI = new GoogleGenerativeAI(apiKey);
		const model = generativeAI.getGenerativeModel({
			model: "gemini-2.0-flash-lite",
		});

		const prompt = `Provide only 3 links to helpful pages for this python error. DO NOT PROVIDE ANY OTHER TEXT: ${err}. provide only the links, with space between them.`;
		try {
			const result = await model.generateContent(prompt);
			const response = result.response.text();
			return response;
		} catch (error) {
			console.error(error);
			return "Failed to get articles";
		}
	}

	const outputArticles = async () => {
		// Output the articles
		if (selectedFile && files[selectedFile]?.errors) {
			try {
				const articles = await getArticles(files[selectedFile].errors);
				console.log(articles);
				const articlesArray = articles
					.split(/\s+/)
					.filter((link) => link.startsWith("http"));
				setSearchResults((prevResults) => [
					...prevResults,
					...articlesArray.map((link) => ({ link, title: link })),
				]);
			} catch (error) {
				console.error((error as Error).message);
			}
		}
	};

	async function simplifyError(err: string): Promise<string> {
		// Use Google's Generative AI to simplify the error
		console.log(err);
		if (!apiKey) {
			throw new Error(
				"API key is undefined. Please set REACT_APP_GEMINI_API_KEY."
			);
		}
		const generativeAI = new GoogleGenerativeAI(apiKey);
		const model = generativeAI.getGenerativeModel({
			model: "gemini-2.0-flash",
		});

		const prompt = `Provide a simplified explanation for a novice programmer, to the following python error: ${err}. Keep it short`;

		try {
			const result = await model.generateContent(prompt);
			const response = result.response.text();
			return response;
		} catch (error) {
			console.error(error);
			return "Failed to simplify error";
		}
	}

	const outputSimplifiedError = async () => {
		// Output the simplified error
		if (selectedFile && files[selectedFile]?.errors) {
			try {
				const simplifiedError = await simplifyError(files[selectedFile].errors);
				setFiles((prevFiles) => ({
					...prevFiles,
					[selectedFile]: {
						...prevFiles[selectedFile],
						simplifiedError: simplifiedError,
					},
				}));
			} catch (error) {
				console.error((error as Error).message);
			}
		}
	};

	return (
		<>
			<div>
				<h1>Error View</h1>
				<div className="fileList">
					<button onClick={getFile}>Upload file</button>
					<ul>
						{Object.keys(files).map((file) => (
							<li className="file" key={file}>
								<button onClick={() => outputErrors(file)}>
									{files[file].name}
								</button>
								<button
									className="remove"
									onClick={() => {
										setFiles((prevFiles) => {
											const updatedFiles = { ...prevFiles };
											delete updatedFiles[file];
											return updatedFiles;
										});
										if (selectedFile === file) {
											setSelectedFile(null);
										}
									}}
								>
									X
								</button>
							</li>
						))}
					</ul>
				</div>
				<div className="errors">
					<pre>
						<code>{selectedFile ? files[selectedFile]?.errors : ""}</code>
					</pre>
					<div className="btn-wrapper">
						<button onClick={outputSimplifiedError}>Simplify error</button>
					</div>
					<pre>
						<code>
							{selectedFile ? files[selectedFile]?.simplifiedError : ""}
						</code>
					</pre>
					<button
						onClick={() => {
							// searchStackOverflow(
							// 	selectedFile ? files[selectedFile]?.errors : ""
							// )
							outputArticles();
							console.log(searchResults);
						}}
					>
						Search StackOverflow
					</button>
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
