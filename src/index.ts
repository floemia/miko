import "dotenv/config";
import 'module-alias/register';

import { Bot } from "@core/Bot";
import { Logger } from "@utils/logger";

const client = new Bot();

client.start().catch(err => {
	Logger.err({ prefix: "[ERROR]", message: `An error has occurred.`, important: true })
	Logger.err({ prefix: "[ERROR]", message: err.stack })
});
export { client };