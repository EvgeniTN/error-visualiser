import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { spawn, ChildProcess } from "child_process";

let serverProcess: ChildProcess | null = null;

export function activate(context: vscode.ExtensionContext) {
	console.log(
		'Congratulations, your extension "error-visualiser" is now active!'
	);

	const serverProcess = spawn(
		"node",
		[path.join(context.extensionPath, "server.js")],
		{
			detached: true,
			stdio: "ignore",
		}
	);

	serverProcess.unref();

	let disposable = vscode.commands.registerCommand(
		"error-visualiser.errorView",
		async () => {
			// Create and show a new webview panel
			const panel = vscode.window.createWebviewPanel(
				"errorVisualiser",
				"Error Visualiser",
				vscode.ViewColumn.One,
				{
					enableScripts: true,
					localResourceRoots: [
						vscode.Uri.file(path.join(context.extensionPath, "dist")),
					],
				}
			);

			const htmlPath = vscode.Uri.file(
				path.join(context.extensionPath, "dist", "index.html")
			);
			const htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");

			// Update the HTML content to use WebView URIs for local resources
			const scriptUri = panel.webview.asWebviewUri(
				vscode.Uri.file(path.join(context.extensionPath, "dist", "bundle.js"))
			);
			const styleUri = panel.webview.asWebviewUri(
				vscode.Uri.file(path.join(context.extensionPath, "dist", "styles.css"))
			);
			const updatedHtmlContent = htmlContent
				.replace(
					"</head>",
					`<link href="${styleUri}" rel="stylesheet" /></head>`
				)
				.replace("</body>", `<script src="${scriptUri}"></l></body>`);

			panel.webview.html = updatedHtmlContent;
		}
	);
	context.subscriptions.push(disposable);
}

export function deactivate() {
	if (serverProcess) {
		serverProcess.kill();
	}
}
