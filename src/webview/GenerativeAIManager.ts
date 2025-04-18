import { GoogleGenerativeAI } from "@google/generative-ai";

export class GenerativeAIManager {
	private apiKey: string;

	constructor(apiKey: string) {
		if (!apiKey) {
			console.log("API key is undefined. Please set REACT_APP_GEMINI_API_KEY.");
		}
		this.apiKey = apiKey;
	}

	private getModel(modelName: string) {
		const generativeAI = new GoogleGenerativeAI(this.apiKey);
		return generativeAI.getGenerativeModel({ model: modelName });
	}

	async simplifyError(error: string): Promise<string> {
		const model = this.getModel("gemini-2.0-flash");
		const prompt = `Provide a simplified explanation for a novice programmer, to the following python error: ${error}. Keep it short`;

		try {
			const result = await model.generateContent(prompt);
			return result.response.text();
		} catch (error) {
			console.error(error);
			return "Failed to simplify error";
		}
	}

	async getArticles(error: string): Promise<string[]> {
		const model = this.getModel("gemini-2.0-flash-lite");
		const prompt = `Provide only 3 links to helpful pages for this python error. DO NOT PROVIDE ANY OTHER TEXT: ${error}. Provide only the links, with space between them.`;

		try {
			const result = await model.generateContent(prompt);
			const response = result.response.text();
			return response.split(/\s+/).filter((link) => link.startsWith("http"));
		} catch (error) {
			console.error(error);
			return [];
		}
	}
}
