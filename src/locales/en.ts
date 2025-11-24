import { DroidUser } from "@floemia/osu-droid-utils";
import { DroidServer, DroidServerData } from "@structures/osu!droid";
import { DroidHelper } from "@utils/helpers";
import { channel } from "diagnostics_channel";

const droid_user_options: Record<string, string> = {
    user: "The Discord user linked to the osu!droid account.",
    uid: "The UID of the player.",
    username: "The username of the player.",
    server: "The server to fetch scores from."
}

export default {
    general: {
        cooldown: (seconds: number) => `You're going way too fast! Please wait ${seconds.toFixed(1)} seconds.`,
        error: "An error occurred.",
        no_dev: "You are not a developer of this bot.",
        user_dne: "That user does not exist.",
        mention_no_link: "The user you mentioned does not have a linked osu!droid account.",
        no_link: "You don't have a linked osu!droid account. Use `/link` first.",
        no_scores: `This user has no sumbitted scores.`,
    },
    commands: {
        config: {
            track: {
                status: (enabled: boolean) => `The osu!droid score tracking system is now ${enabled ? "enabled" : "disabled"}.`,
                channel: {
                    set: (channel: string, permission: boolean) => `The osu!droid scores tracking channel has been set to ${channel}.${permission ? "" : ".. **but I don't have permissions to send messages in that channel!**"}`,
                }
            },
        },
            recent: {
            description: "Get the most recent scores from yourself or a player.",
            options: { ...droid_user_options, index: "The n-th score to show (1 - 50). Defaults to the most recent score." },
            responses: {
                process: (user: DroidUser) => `Processing recent scores from ${DroidHelper.userToString(user, "flag")}...`,
            }
        },
        recent50: {
            description: "Get the most recent 50 scores from yourself or a player.",
            options: droid_user_options
        },
        link: {
            description: "Link your Discord account to an osu!droid user.",
            options: droid_user_options,
            responses: {
                ok: (user: DroidUser) => `Your Discord account has been linked to ${DroidHelper.userToString(user, "flag")}.`,
            }
        },
        defaultserver: {
            description: "Set your default osu!droid server.",
            options: {
                server: "The desired server.",
            },
            responses: {
                ok: (server: DroidServerData) => `Your default server has been set to ${server.name}.`,
            }
        },
        card: {
            description: "Get your osu!droid profile card.",
            options: droid_user_options,
            responses: {
                generating: (user: DroidUser) => `Generating osu!droid profile card for ${DroidHelper.userToString(user, "flag")}...`,
            }
        },
        top: {
            description: "Get the top scores from yourself or a player.",
            options: droid_user_options,
            responses: {
                process: (user: DroidUser) => `Getting top scores from ${DroidHelper.userToString(user, "flag")}...`,
            }
        },
        tracking: {
            add: {
                description: "Adds an user to the osu!droid score tracking system.",
                responses: {
                    ok: (user: DroidUser) => `${DroidHelper.userToString(user, "flag")} has been added to the osu!droid score tracking system.`,
                    already_in: `That user is already in the osu!droid score tracking system.`
                }
            },
            delete: {
                description: "Deletes an user from the osu!droid score tracking system.",
                responses: {
                    ok: (user: DroidUser) => `${DroidHelper.userToString(user, "flag")} has been deleted from the osu!droid score tracking system.`,
                    not_in: `That user is not in the osu!droid score tracking system.`
                }
            }
        }
    }
} as const;