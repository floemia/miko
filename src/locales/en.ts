import { client } from "@root";
import { DroidUser } from "@floemia/osu-droid-utils";
import { TimeHelper } from "@utils/helpers/TimeHelper";
import { Localization } from "./Localization";
import { DroidHelper, EmojiHelper } from "@utils/helpers";

const cute_emoji = "<:miko01:1417587405124403280>";
export const en: Localization = {
	general: {
		disabled: "This command is temporarily disabled.",
		error: "An error has occurred.",
		cooldown: (time: number) => `You're being too fast! Please wait \`${time.toFixed(1)}s\`.`,
		user_dne: "That user does not exist.",
		no_scores: (user: DroidUser) => `No scores found for ${DroidHelper.userToString(user, false)}.`,
		dev_only: "This command is only available for <@596481414426525696>.",
		scraping: "⚠️ Using web scraping method! Expect some errors.",
		you_no_link: "You don't have a linked osu!droid account. Use /link or specify a user.",
		mention_no_link: "The mentioned user doesn't have a linked osu!droid account.",
		api_broken: `The API is currently broken and the fallback method doesn't support usernames. Please use UIDs.`
	},
	commands: {
		ping: {
			response: (ping: number) => `The ping is \`${ping.toFixed(2)}ms\`.`,
		},
		recent: {
			generating: (user: DroidUser) => `${cute_emoji} | Getting recent scores of ${DroidHelper.userToString(user, false)}...`,
			message: (user: DroidUser, index: number) => `${cute_emoji} | Recent score #${index + 1} from  **${DroidHelper.userToString(user, false)}:**${client.config.scraping ? `\n-# ${en.general.scraping}` : ``}`,
		},
		link: {
			success: (user: DroidUser) => `Your Discord account has been linked to  **${DroidHelper.userToString(user, false)}**.`,
		},
		top: {
			generating: (user: DroidUser) => `${cute_emoji} | Getting top scores of  **${DroidHelper.userToString(user, false)}**...`,
			title: "Top 50 scores"
		},
		uptime: {
			response: (uptime: number) => `Miko's uptime is \`${TimeHelper.msToTime(uptime)}\`.`,
		},
		config: {
			track_channel: {
				set: (channel: string, permission: boolean) => `The osu!droid scores tracking channel has been set to ${channel}.${permission ? "" : ".. **but I don't have permissions to send messages in that channel!**"}`,
			},
			track: {
				enabled: (status: boolean) => `The osu!droid scores tracking system has been ${status ? "enabled" : "disabled"}.`,
			},
			prefix: {
				set: (prefix: string) => `The prefix has been set to \`${prefix}\` for this server.`,
			}
		},
		defaultserver: {
			response: (server: string) => `Your default osu!droid server has been set to ${server}.`,
		},
		card: {
			generating: (user: DroidUser) => `${cute_emoji} | Generating profile card of  **${DroidHelper.userToString(user, false)}**...`,
		},
		recent50: {
			generating: (user: DroidUser) => `${cute_emoji} | Getting the 50 most recent scores of  **${DroidHelper.userToString(user, false)}**...`,
			title: "Recent 50 scores"
		}
	},
	tracking: {
		message: (user: DroidUser) => `${cute_emoji} | Recent score from  **${DroidHelper.userToString(user, false)}:**${client.config.scraping ? `\n-# ${en.general.scraping}` : ``}`

	}
}