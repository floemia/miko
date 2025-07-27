import fs from "fs";
import path from "path";

export abstract class FileManager {
    static getAvatarList() {
        return fs.readdirSync("./assets/avatars/").map(file => `./assets/avatars/${file}`);
    }

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