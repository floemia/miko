/**
 * Configuration for the osu!droid score tracking system.
 */
export interface TrackingConfig {
    /**
     * Whether the bot should track scores or not.
     */
    enabled: boolean;

    /**
     * The interval in milliseconds between steps.
     */
    interval: number;
}