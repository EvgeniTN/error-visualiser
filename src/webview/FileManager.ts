export class FileManager {
	private files: { [key: string]: any };
	private selectedFile: string | null;

	constructor() {
		this.files = JSON.parse(sessionStorage.getItem("files") || "{}");
		this.selectedFile = sessionStorage.getItem("selectedFile");
	}

	getFiles() {
		return this.files;
	}

	getSelectedFile() {
		return this.selectedFile;
	}

	setFiles(files: { [key: string]: any }) {
		this.files = files;
		sessionStorage.setItem("files", JSON.stringify(files));
	}

	setSelectedFile(file: string | null) {
		this.selectedFile = file;
		if (file) {
			sessionStorage.setItem("selectedFile", file);
		} else {
			sessionStorage.removeItem("selectedFile");
		}
	}

	addFile(scriptPath: string, filename: string) {
		if (!this.files[scriptPath] && filename.endsWith(".py")) {
			this.files[scriptPath] = { name: filename, errors: "" };
			this.setFiles(this.files);
		}
	}

	removeFile(scriptPath: string) {
		delete this.files[scriptPath];
		this.setFiles(this.files);
		if (this.selectedFile === scriptPath) {
			this.setSelectedFile(null);
		}
	}
}
