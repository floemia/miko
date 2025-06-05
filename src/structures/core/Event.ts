import { Bot } from "@core";
import { ClientEvents } from "discord.js";

export interface Event<T extends keyof ClientEvents> {
	name: T;
	once?: boolean;
	rest?: boolean;
	run: (client: Bot, ...args: ClientEvents[T]) => Promise<any>
}