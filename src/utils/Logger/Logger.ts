import { Misc } from "@utils";
import { LogCreatorParameters } from "@utils/Logger/";
import chalk from "chalk";

export abstract class Logger {
	public static out(params: LogCreatorParameters): void {
		const date = Misc.formatDate(new Date());
		const reset = `\x1b[0m`;
		const color = chalk.hex(Misc.getHexColor(params.color || "Green"));
		params.message.split("\n").forEach(line => {
			if (line.trim()) {
				if (!params.important) console.log(`${color('●')} ${date} ${color.bold(params.prefix)}${chalk.reset(' - ' + line)}`);
				else console.log(`${color('●')} ${date} ${color.bold(params.prefix + ' - ' + line)}${reset}`);
			}
		})
	}

	public static err(params: LogCreatorParameters): void {
		const date = Misc.formatDate(new Date());
		const color = chalk.hex("#FF0000");
		const reset = `\x1b[0m`;

		params.message.split("\n").forEach(line => {
			if (line.trim()) {
				if (!params.important) console.log(`${color('●')} ${date} ${color.bold(params.prefix + "[ERROR]")}${chalk.reset(' - ' + line)}`);
				else console.log(`${color('●')} ${date} ${color.bold(params.prefix + "[ERROR]" + ' - ' + line)}${reset}`);
			}
		})
	}
}