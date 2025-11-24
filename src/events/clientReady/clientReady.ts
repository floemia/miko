import { Event } from "@structures/core";
import { Logger as log } from "@utils/helpers";

export const name = "clientReady";

export const run: Event<"clientReady">["run"] = async (client) => {
	log.out({ prefix: "CLIENT", message: `Logged in as ${client.user?.displayName}!` })
	client.startAvatarCycle();
}