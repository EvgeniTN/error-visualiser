import * as vscode from "vscode";
import { spawn } from "child_process";

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

function getWebviewContent(errors: string[]) {
	return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error Visualiser</title>
    </head>
    <body>
      <h1>Error Visualiser</h1>
      <ul>
        ${errors.map((error) => `<li>${error}</li>`).join("")}
      </ul>
    </body>
    </html>`;
}

export function activate(context: vscode.ExtensionContext) {
	console.log(
		'Congratulations, your extension "error-visualiser" is now active!'
	);

	let disposable = vscode.commands.registerCommand(
		"error-visualiser.errorView",
		() => {
			const panel = vscode.window.createWebviewPanel(
				"errorVisualiser",
				"Error Visualiser",
				vscode.ViewColumn.One,
				{}
			);
			getPythonErrors("/Users/evgeninikolov/Developer/test/main.py")
				.then((errors) => {
					panel.webview.html = getWebviewContent(errors);
				})
				.catch((err) => {
					console.error("Failed to get Python errors:", err);
					panel.webview.html = getWebviewContent([
						`Failed to get Python errors: ${err.message}`,
					]);
				});
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
