import * as vscode from "vscode";
import { activate } from "./extension";

export function getWebviewContent(): string {
	const webviewContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Webview</title>
        </head>
        <body>
            <h1>Hello from Webview</h1>
            <button>Click me</button>
        </body>
        </html>
    `;
	return webviewContent;
}
