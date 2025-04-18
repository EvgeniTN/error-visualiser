import React, { useState, useEffect } from "react";
import "./styles.css";
import { GoogleGenerativeAI } from "@google/generative-ai";

const App: React.FC = () => {
	const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
	const [files, setFiles] = useState<{
		[key: string]: {
			name: string;
			errors: string;
			simplifiedError?: string;
			searchResults?: { link: string; title: string }[];
			isSimplifiedErrorGenerated?: boolean;
		};
	}>(() => {
		const savedFiles = sessionStorage.getItem("files");
		return savedFiles ? JSON.parse(savedFiles) : {};
	});
	const [selectedFile, setSelectedFile] = useState<string | null>(() => {
		return sessionStorage.getItem("selectedFile");
	});
	const [isSimplifiedErrorGenerated, setIsSimplifiedErrorGenerated] =
		useState(false);

	useEffect(() => {
		sessionStorage.setItem("files", JSON.stringify(files));
	}, [files]);

	useEffect(() => {
		if (selectedFile) {
			sessionStorage.setItem("selectedFile", selectedFile);
		} else {
			sessionStorage.removeItem("selectedFile");
		}
	}, [selectedFile]);

	useEffect(() => {
		const handleBeforeUnload = () => {
			sessionStorage.removeItem("selectedFile");
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

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
				setFiles((prevFiles) => ({
					...prevFiles,
					[selectedFile]: {
						...prevFiles[selectedFile],
						searchResults: articlesArray.map((link) => ({
							link,
							title: link,
						})),
					},
				}));
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
						isSimplifiedErrorGenerated: true,
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
					{selectedFile && files[selectedFile]?.isSimplifiedErrorGenerated && (
						<div className="articles-wrapper">
							<p>Still stuck?</p>
							<button
								onClick={() => {
									outputArticles();
								}}
							>
								Browse articles
							</button>
							<ul>
								{selectedFile &&
									files[selectedFile]?.searchResults?.map((result, index) => (
										<li key={index}>
											<a
												href={result.link}
												target="_blank"
												rel="noopener noreferrer"
											>
												{result.title}
											</a>
										</li>
									))}
							</ul>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default App;
