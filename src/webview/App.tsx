import React, { useState } from "react";

const App: React.FC = () => {
	const [errors, setErrors] = useState("");

	const outputErrors = async () => {
		try {
			const response = await fetch("http://localhost:3003/run-python");
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
				<h1>Hello from React</h1>
				<button onClick={outputErrors}>Click me</button>
				<p>{errors}</p>
			</div>
		</>
	);
};

export default App;
