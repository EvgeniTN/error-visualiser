"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
function getConsoleErrors() {
    const errors = [];
    const originalConsoleError = console.error;
    console.error = function (message, ...optionalParams) {
        errors.push(message);
        originalConsoleError.apply(console, [message, ...optionalParams]);
    };
    return errors;
}
function activate(context) {
    console.log('Congratulations, your extension "error-visualiser" is now active!');
    let disposable = vscode.commands.registerCommand("error-visualiser.errorView", () => {
        // Create and show a new webview panel
        const panel = vscode.window.createWebviewPanel("errorVisualiser", "Error Visualiser", vscode.ViewColumn.One, {});
        // Set the webview's HTML content
        panel.webview.html = getWebviewContent();
    });
    context.subscriptions.push(disposable);
    // Initialize console error capturing
    getConsoleErrors();
}
//# sourceMappingURL=readConsole.js.map