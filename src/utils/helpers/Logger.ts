
import chalk from "chalk";
import { TimeHelper } from "@utils/helpers";
import { Config } from "@core/Config";

export type LogCreatorParameters = {
	prefix: string;
	message: string;
	color?: string;
	important?: boolean;
	error?: any;
}

/**
 * Utility class for logging.
 */
export abstract class Logger {

	/**
	 * Main log function.
	 * @param params Log parameters.
	 */
	private static main(params: LogCreatorParameters): void {
		const isError = params.prefix == "ERROR";
		const print = isError ? console.error : console.log;

		const date = TimeHelper.nowFormatted();
		const reset = `\x1b[0m`;
		const c = chalk.hex(isError ? Config.colors.error : params.color ?? Config.colors.default);


		params.message.split("\n").forEach(line => {
			if (line.trim()) {
				if (!params.important) print(`${c('●')} ${date} ${c.bold(`[${params.prefix}]`)} ${chalk.reset(line)}`);
				else print(`${c('●')} ${date} ${c.bold(`[${params.prefix}] ${line}`)}${reset}`);
			}
		})
	}

	/**
	 * Prints a message to stdout.
	 * @param params Log parameters.
	 */
	public static out(params: LogCreatorParameters): void {
		switch (params.prefix) {
			case "TRACKING":
				params.color = Config.colors.tracking;
				break;
			case "DATABASE":
				params.color = Config.colors.connection;
				break;
			default:
				params.color = Config.colors.default;
		}
		this.main(params);
	}

	/**
	 * Prints a message to stderr.
	 * @param params Log parameters.
	 */
	public static err(params: LogCreatorParameters): void {
		if (params.error instanceof Error) {
			this.main({ ...params, prefix: "ERROR", message: `${params.error.name}: ${params.error.message}`, important: true });
			this.main({ ...params, prefix: "ERROR", message: `${params.error.stack}`});
		}
		this.main({ ...params, prefix: "ERROR", color: Config.colors.error });
	}
}