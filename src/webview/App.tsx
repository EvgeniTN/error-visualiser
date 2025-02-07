import React from "react";

const App: React.FC = () => {
	return (
		<div>
			<h1>Hello from React</h1>
			<button onClick={() => alert("Button clicked!")}>Click me</button>
		</div>
	);
};

export default App;
