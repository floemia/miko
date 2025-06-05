import fs from "fs";
import path from "path";

export abstract class Files implements Files {
	public static getJsFiles(dir: string, jsFiles: string[] = []) {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				this.getJsFiles(fullPath, jsFiles);
			} else if (entry.isFile() && entry.name.endsWith(".js"))
				jsFiles.push(fullPath);
		}
		return jsFiles;
	}
}