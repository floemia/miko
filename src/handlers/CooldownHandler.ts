import { Cooldown, SlashCommand } from "@structures/core";
import { Collection, User } from "discord.js";

/**
 * Utility class for handling command cooldowns.
 */
export abstract class CooldownHandler {
    /**
     * A `Collection` of cooldowns.
     * 
     * The key is the command name, the value is an array of `Cooldown` objects.
     */
    private static cooldowns = new Collection<string, Cooldown[]>();

    /**
     * Adds a command to the cooldowns collection.
     * @param command The `SlashCommand` to add.
     */
    static addCommand(command: SlashCommand): void {
        if (!this.cooldowns.has(command.data.name)) this.cooldowns.set(command.data.name, []);
    }

    /**
     * Calculates the time left before the cooldown expires.
     * @param command The command affected by the cooldown.
     * @param user The user to calculate the time left for.
     * @returns The time left in seconds.
     */
    static timeLeft(command: SlashCommand, user: User): number {
        const now = new Date();
        const cd_list = this.cooldowns.get(command.data.name)!
        const user_cd = cd_list.find(cd => cd.user_id === user.id);
        if (!user_cd) {
            cd_list.push({
                user_id: user.id,
                executed_at: now,
                cooldown: command.cooldown ?? 5
            });
            return -1;
        }

        const expiresAt = new Date(user_cd.executed_at.getTime() + user_cd.cooldown * 1000);
        return (expiresAt.getTime() - now.getTime()) / 1000;
    }
}