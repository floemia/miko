/**
 * A cooldown for a slash command.
 */
export interface Cooldown {
    /**
     * The ID of the user affected by the cooldown.
    */
    user_id: string,

    /**
     * Time at which the command was executed.
     */
    executed_at: Date

    /**
     * The cooldown in seconds.
     */
    cooldown: number;
}