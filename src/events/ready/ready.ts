import { Event } from "@structures/core/Event";
import { Logger } from "@utils/Logger";
export const name = "ready";

export const run: Event<"ready">["run"] = async (client) => {
	Logger.out({ prefix: "[CLIENT]", message: `Logged in as ${client.user?.displayName}!`, color: "Purple" })
}