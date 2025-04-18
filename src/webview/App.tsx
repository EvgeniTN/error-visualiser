import React, { useState, useEffect } from "react";
import "./styles.css";
import { FileManager } from "./FileManager";
import { GenerativeAIManager } from "./GenerativeAIManager";

interface SearchResult {
	title: string;
	url: string;
}

const App: React.FC = () => {
	const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
	const fileManager = new FileManager();
	const aiManager = new GenerativeAIManager(apiKey);

	const [files, setFiles] = useState(fileManager.getFiles());
	const [selectedFile, setSelectedFile] = useState(
		fileManager.getSelectedFile()
	);

	useEffect(() => {
		const handleBeforeUnload = () => {
			fileManager.setSelectedFile(null);
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, []);

	const getFile = async () => {
		try {
			console.log("Attempting to read from clipboard...");
			const filePath = await navigator.clipboard.readText();
			console.log("Clipboard content:", filePath);
			const filename = filePath.split("/").pop() || "";
			fileManager.addFile(filePath, filename);
			const updatedFiles = { ...fileManager.getFiles() }; // Create a new object
			setFiles(updatedFiles);
			console.log("Updated files:", updatedFiles);
		} catch (error) {
			console.error("Error reading clipboard:", (error as Error).message);
		}
	};

	const outputErrors = async (url: string) => {
		try {
			const response = await fetch(
				`http://localhost:3003/run-python?scriptPath=${encodeURIComponent(url)}`
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			const updatedFiles = {
				...files,
				[url]: { ...files[url], errors: data.errors.toString() },
			};
			fileManager.setFiles(updatedFiles);
			setFiles(updatedFiles);
			fileManager.setSelectedFile(url);
			setSelectedFile(url);
		} catch (error) {
			console.error((error as Error).message);
		}
	};

	const outputSimplifiedError = async () => {
		if (selectedFile && files[selectedFile]?.errors) {
			try {
				const simplifiedError = await aiManager.simplifyError(
					files[selectedFile].errors
				);
				const updatedFiles = {
					...files,
					[selectedFile]: {
						...files[selectedFile],
						simplifiedError,
						isSimplifiedErrorGenerated: true,
					},
				};
				fileManager.setFiles(updatedFiles);
				setFiles(updatedFiles);
			} catch (error) {
				console.error((error as Error).message);
			}
		}
	};

	const outputArticles = async () => {
		if (selectedFile && files[selectedFile]?.errors) {
			try {
				const articles = await aiManager.getArticles(
					files[selectedFile].errors
				);
				const updatedFiles = {
					...files,
					[selectedFile]: {
						...files[selectedFile],
						searchResults: articles.map((link) => ({ link, title: link })),
					},
				};
				fileManager.setFiles(updatedFiles);
				setFiles(updatedFiles);
			} catch (error) {
				console.error((error as Error).message);
			}
		}
	};

	return (
		<div>
			<h1>Error View</h1>
			<div className="fileList">
				<button
					onClick={() => {
						getFile();
						console.log("Rendering files:", files);
					}}
				>
					Upload file
				</button>
				<ul>
					{Object.keys(files).map((file) => (
						<li className="file" key={file}>
							<button onClick={() => outputErrors(file)}>
								{files[file].name}
							</button>
							<button
								className="remove"
								onClick={() => {
									fileManager.removeFile(file);
									setFiles(fileManager.getFiles());
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
						<button onClick={outputArticles}>Browse articles</button>
						<ul>
							{files[selectedFile]?.searchResults?.map(
								(result: SearchResult, index: number) => (
									<li key={index}>
										<a
											href={result.url}
											target="_blank"
											rel="noopener noreferrer"
										>
											{result.title}
										</a>
									</li>
								)
							)}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
};

export default App;
