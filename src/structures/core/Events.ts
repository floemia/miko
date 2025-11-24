import { MikoClient } from "@core/MikoClient";
import { ClientEvents } from "discord.js";

/**
 * A basic event.
 */
export interface Event<T extends keyof ClientEvents> {
    /**
     * The name of the event.
     */
	name: T;

    /**
     * Whether the event should be run only once or not.
     */
	once?: boolean;

    /**
     * Whether the event should be run in a REST context or not.
     */
	rest?: boolean;

    /**
     * The function that will be executed when the event is triggered.
     * @param client The instance of the client.
     * @param args The arguments passed to the event.
     */
	run: (client: MikoClient, ...args: ClientEvents[T]) => Promise<any>
}