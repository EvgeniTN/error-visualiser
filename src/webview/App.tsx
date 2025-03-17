import React, { use, useState } from "react";
import "./styles.css";

const App: React.FC = () => {
	const [errors, setErrors] = useState("");
	const [scriptPath, setScriptPath] = useState("");
	const [files, setFiles] = useState<{ [key: string]: string }>({});

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
				<code>{errors}</code>
			</div>
		</>
	);
};

export default App;
