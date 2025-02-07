import React from "react";
// import WebviewContent from "../WebviewContent";

const App: React.FC = () => {
	return (
		<>
			<div>
				<h1>Hello from React</h1>
				<button onClick={() => alert("Button clicked!")}>Click me</button>
			</div>
			{/* <WebviewContent /> */}
		</>
	);
};

export default App;
