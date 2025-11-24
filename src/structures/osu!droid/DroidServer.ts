/**
 * The supported osu!droid servers.
 */
export type DroidServer = "ibancho" | "rx";

/**
 * The data of an osu!droid server.
 */
export interface DroidServerData {
    /**
     * The codename of the server.
     * 
     * This is internally used by this bot for osu!droid commands.
     */
    codename: DroidServer;

    /**
     * The full name of the server.
     */
    name: string;

    /**
     * The URL of the server's icon.
     */
    iconURL: string;
}