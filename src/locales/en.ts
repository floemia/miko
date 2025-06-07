import { Misc } from "@utils";
import { client } from "@root";
import { DroidUser } from "miko-modules";
export const en = {
	general: {
		error: "An error has occurred.",
		cooldown: (time: number) => `You're being too fast! Please wait \`${time.toFixed(1)}s\`.`,
		user_dne: "That user does not exist.",
		no_scores: (user: DroidUser) => `No scores found for ${user.toString()}.`,
		dev_only: "This command is only available for <@596481414426525696>.",
		scraping: "⚠️ Using web scraping method! Expect some errors.",
	},
	commands: {
		ping: {
			response: (ping: number) => `The ping is \`${ping.toFixed(2)}ms\`.`,
		},
		recent: {
			generating: (user: DroidUser) => `Getting recent scores of ${user.toString()}...`,
			message: (user: DroidUser, index: number) => `<:droid_simple:1021473577951821824>  **osu!droid・**Recent score #${index + 1} from  **${user.toString()}:**${client.config.scraping ? `\n-# ${en.general.scraping}` : ``}`,
		},
		userbind: {
			success: (user: DroidUser) => `Your Discord account has been linked to ${user.toString()}.`,
		},
		top: {
			generating: (user: DroidUser) => `Getting top scores of ${user.toString()}...`,
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
			}
		},
		defaultserver: {
			response: (server: string) => `Your default osu!droid server has been set to ${server}.`,
		}
	},
	tracking: {
		message: (user: DroidUser) => `<:droid_simple:1021473577951821824>  **osu!droid・**Recent score from  **${user.toString()}:**${client.config.scraping ? `\n-# ${en.general.scraping}` : ``}`

	}
}