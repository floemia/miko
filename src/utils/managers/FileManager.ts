import fs from "fs";
import path from "path";

/**
 * Utility class for managing files.
 */
export abstract class FileManager {
    /**
     * Recursively scans a directory and its subdirectories for JavaScript files.
     * @param dir The main directory.
     * @param jsFiles An array to store the found JavaScript files.
     * @returns The found JavaScript files.
     */
    static getJSFiles(dir: string, jsFiles: string[] = []) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                this.getJSFiles(fullPath, jsFiles);
            } else if (entry.isFile() && entry.name.endsWith(".js"))
                jsFiles.push(fullPath);
        }
        return jsFiles;
    }
}