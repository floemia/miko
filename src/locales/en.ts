import { Misc } from "@utils";
import { client } from "@root";
import { DroidUser } from "miko-modules";
import { card } from "osu-droid-card";
export const en = {
	general: {
		disabled: "This command is temporarily disabled.",
		error: "An error has occurred.",
		cooldown: (time: number) => `You're being too fast! Please wait \`${time.toFixed(1)}s\`.`,
		user_dne: "That user does not exist.",
		no_scores: (user: DroidUser) => `No scores found for ${user.toString()}.`,
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
			generating: (user: DroidUser) => `Getting recent scores of ${user.toString()}...`,
			message: (user: DroidUser, index: number) => `<:droid_simple:1021473577951821824>  **osu!droid・**Recent score #${index + 1} from  **${user.toString()}:**${client.config.scraping ? `\n-# ${en.general.scraping}` : ``}`,
		},
		link: {
			success: (user: DroidUser) => `Your Discord account has been linked to  ${user.toString()}.`,
		},
		top: {
			generating: (user: DroidUser) => `Getting top scores of  ${user.toString()}...`,
		},
		uptime: {
			response: (uptime: number) => `Miko's uptime is \`${Misc.msToTime(uptime)}\`.`,
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
			generating: (user: DroidUser) => `Generating profile card of  ${user.toString()}...`,
		}
	},
	tracking: {
		message: (user: DroidUser) => `<:droid_simple:1021473577951821824>  **osu!droid・**Recent score from  **${user.toString()}:**${client.config.scraping ? `\n-# ${en.general.scraping}` : ``}`

	}
}