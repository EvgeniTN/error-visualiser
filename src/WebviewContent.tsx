import React from "react";
import { activate } from "./extension";

const WebviewContent: React.FC = () => {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Webview</title>
			</head>
			<body>
				<h1>Hello from Webview</h1>
				<button onClick={() => activate}>Click me</button>
			</body>
		</html>
	);
};

export default WebviewContent;
