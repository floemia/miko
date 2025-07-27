import { ColorHelper, TimeHelper, Color } from "@utils/helpers"
import chalk from "chalk";

export type LogCreatorParameters = {
	prefix: string;
	message: string;
	color?: Color;
	important?: boolean;
}


export abstract class Logger {
	public static out(params: LogCreatorParameters): void {
		const date = TimeHelper.nowFormatted();
		const reset = `\x1b[0m`;
		const color = chalk.hex(ColorHelper.getHexColor(params.color || "Green"));
		params.message.split("\n").forEach(line => {
			if (line.trim()) {
				if (!params.important) console.log(`${color('●')} ${date} ${color.bold(params.prefix)} ${chalk.reset(line)}`);
				else console.log(`${color('●')} ${date} ${color.bold(`${params.prefix} ${line}`)}${reset}`);
			}
		})
	}

	public static err(params: LogCreatorParameters): void {
		const date = TimeHelper.nowFormatted();
		const color = chalk.hex("#FF0000");
		const reset = `\x1b[0m`;

		params.message.split("\n").forEach(line => {
			if (line.trim()) {
				if (!params.important) console.error(`${color('●')} ${date} ${color.bold(params.prefix + "[ERROR]")}${chalk.reset(' - ' + line)}`);
				else console.error(`${color('●')} ${date} ${color.bold(params.prefix + "[ERROR]" + ' - ' + line)}${reset}`);
			}
		})
	}
}