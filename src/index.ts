import "dotenv/config";
import 'module-alias/register';

import { Bot } from "@core/Bot";
import { Logger } from "@utils/Logger";

const client = new Bot();

client.start().catch(err => {
	Logger.err({ prefix: "[ERROR]", message: err.message })
	Logger.err({ prefix: "[ERROR]", message: err.stack })
});
export { client };