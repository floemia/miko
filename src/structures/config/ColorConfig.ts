/**
 * Colors for the bot's output.
 */
export interface ColorConfig {
    /**
     * Connection color.
     */
    connection: string;

    /**
     * Debug color.
     */
    debug: string;

    /**
     * Error color.
     */
    error: string;

    /**
     * Score tracking color.
     */
    tracking: string;

    /**
     * Everything else.
     */
    default: string;
}