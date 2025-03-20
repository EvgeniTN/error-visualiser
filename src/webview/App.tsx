import React, { use, useState, useEffect } from "react";
import "./styles.css";

const App: React.FC = () => {
	const [errors, setErrors] = useState("");
	const [scriptPath, setScriptPath] = useState("");
	const [files, setFiles] = useState<{ [key: string]: string }>({});
	const [searchResults, setSearchResults] = useState([]);

	const getFile = async () => {
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
		// useEffect(() => {
		// 	fetch(`https://api.stackexchange.com/2.3/search?order=desc&sort=activity&tagged=python&intitle=${err}&site=stackoverflow`).then(
		// 		(response) => setSearchResults(response)
		// }
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
						<button onClick={() => searchStackOverflow(errors)}>
							Search SO
						</button>
						<ul>
							{searchResults.map((result: any, index: number) => (
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
					</pre>
				</div>
			</div>
		</>
	);
};

export default App;
