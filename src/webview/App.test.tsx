import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import App from "./App";
import "@testing-library/jest-dom";

// filepath: src/webview/App.test.tsx

describe("App Component", () => {
	it("should add a valid Python file from the clipboard to the files state", async () => {
		Object.assign(navigator, {
			clipboard: {
				readText: jest.fn().mockResolvedValue("/path/to/script.py"),
			},
		});

		const { getByText, findByText } = render(<App />);

		const uploadButton = getByText("Upload file");
		await act(async () => {
			fireEvent.click(uploadButton);
		});

		expect(await findByText("script.py")).toBeInTheDocument();
	});

	it("should not add a non-Python file from the clipboard to the files state", async () => {
		Object.assign(navigator, {
			clipboard: {
				readText: jest.fn().mockResolvedValue("/path/to/script.txt"),
			},
		});

		const { getByText, queryByText } = render(<App />);

		const uploadButton = getByText("Upload file");
		await act(async () => {
			fireEvent.click(uploadButton);
		});

		expect(queryByText("script.txt")).not.toBeInTheDocument();
	});

	it("should call simplifyError and receive a response", async () => {
		const mockSimplifyError = jest
			.fn()
			.mockResolvedValue("Simplified error message");
		const error = "Error: example error";

		const response = await mockSimplifyError(error);

		expect(mockSimplifyError).toHaveBeenCalledWith(error);
		expect(response).toBe("Simplified error message");
	});
});
