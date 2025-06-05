import { Misc } from "@utils";
import { DroidUser } from "miko-modules";

export const en = {
	general: {
		error: "An error has occurred.",
		cooldown: (time: number) => `You're being too fast! Please wait \`${time.toFixed(1)}s\`.`,
		user_dne: "That user does not exist.",
		no_scores: (user: DroidUser) => `No scores found for ${user.toString()}.`,
	},
	commands: {
		ping: {
			response: (ping: number) => `The ping is \`${ping.toFixed(2)}ms\`.`,
		},
		recent: {
			generating: (user: DroidUser) => `Getting recent scores of ${user.toString()}...`,
			message: (user: DroidUser, index: number) => `<:droid_simple:1021473577951821824>  **osu!droid・**Recent score #${index + 1} from  **${user.toString()}:**`,
		},
		userbind: {
			success: (user: DroidUser) => `Your Discord account has been linked to ${user.toString()}.`,
		},
		top: {
			generating: (user: DroidUser) => `Getting top scores of ${user.toString()}...`,
		},
		uptime: {
			response: (uptime: number) => `Miko's uptime is \`${Misc.msToTime(uptime)}\`.`,
		}
	},
	tracking: {
		message: (user: DroidUser) => `<:droid_simple:1021473577951821824>  **osu!droid・**Recent score from  **${user.toString()}:**`,
	}
}