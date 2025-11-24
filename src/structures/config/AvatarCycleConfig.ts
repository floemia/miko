/**
 * Configuration for the avatar cycle.
 */
export interface AvatarCycleConfig {
    /**
     * The interval in milliseconds between steps.
     */
    interval: number;

    /**
     * Whether the bot should cycle through the avatars or not.
     */
    enabled: boolean;

    /**
     * The path to the bot's profile pictures directory.
     */
    path: string;
}