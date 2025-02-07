import * as vscode from "vscode";
import { spawn } from "child_process";
import * as path from "path";
import * as fs from "fs";

function getPythonErrors(pythonScriptPath: string): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const errors: string[] = [];
		const pythonProcess = spawn("python3", [pythonScriptPath]);

		pythonProcess.stderr.on("data", (data) => {
			errors.push(data.toString());
		});

		pythonProcess.on("close", (code) => {
			if (code !== 0) {
				resolve(errors);
			} else {
				resolve([]);
			}
		});

		pythonProcess.on("error", (err) => {
			reject(err);
		});
	});
}

export function activate(context: vscode.ExtensionContext) {
	console.log(
		'Congratulations, your extension "error-visualiser" is now active!'
	);

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
			const updatedHtmlContent = htmlContent.replace(
				"</body>",
				`<script src="${scriptUri}"></script></body>`
			);

			panel.webview.html = updatedHtmlContent;

			const pythonScriptPath = "/Users/evgeninikolov/Developer/test/main.py";
			const errors = await getPythonErrors(pythonScriptPath);
			panel.webview.postMessage(errors);
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
