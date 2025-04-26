import { DroidRXUser, NewDroidUser } from "miko-modules";
import { DroidUser } from "../functions/osu!droid/types";
import { DroidTrackingUser } from "../schemas/types";

export default {
	command: {
		calculate: {
			no_cache: "There is no beatmap in the cache.",
			no_beatmap: "The beatmap does not exist.",
		},
		card: {
			error: (error: string) => `\`\`\`diff\n- An error has occured.\n\`\`\`\n> ${error}`,
			no_params: `You must provide an user to generate a profile card.`,
			no_link: "You don't have a linked osu!droid account. Use \`/userbind\`.",
			mention_no_link: (user: string) => `<@${user}> doesn't have a linked account through \`/userbind\`.`,
			no_user: "The user does not exist.",
			generating: (user: DroidUser) => `> <:graycheck:903741976061567027> <:droid_simple:1021473577951821824>  **osu!droid・**Creating profile card of  :flag_${user.country.toLowerCase()}:  **${user.username}...**`
		},
		recent: {
			error: (error: string) => `\`\`\`diff\n- An error has occured.\n\`\`\`\n> ${error}`,
			no_params: `You must provide an user to get recent scores from.`,
			no_link: `You don't have a linked osu!droid account. Use \`/userbind\`.`,
			mention_no_link: (user: string) => `<@${user}> doesn't have a linked account through \`/userbind\`.`,
			no_user: "The user does not exist.",
			no_scores: (user: NewDroidUser) => `The user  **:flag_${user.region.toLowerCase()}: ${user.username}**  has no submitted scores.`,
			score: (user: NewDroidUser, index: number, penalty: boolean = false) => `<:droid_simple:1021473577951821824>  **osu!droid・**Score #${index + 1} from  :flag_${user.region.toLowerCase()}:  **${user.username}**:\n${penalty ? "-# :warning: Some penalties were found." : ""}`
		},
		top: {
			error: (error: string) => `An error occurred.\n> ${error}`,
			no_params: `You must provide an user to get top scores from.`,
			no_link: `You don't have a linked osu!droid account. Use \`/userbind\`.`,
			mention_no_link: (user: string) => `<@${user}> doesn't have a linked account through \`/userbind\`.`,
			no_user: "The user does not exist.",
			no_scores: (user: NewDroidUser) => `The user  **:flag_${user.region.toLowerCase()}: ${user.username}**  has no submitted scores.`,
		},
		userbind: {
			error: (error: string) => `An error occurred.\n> ${error}`,
			no_params: "You must provide at least one of the following parameters: UID or username",
			no_user: "The user does not exist.",
			linked: (user: NewDroidUser | DroidRXUser) => {
				if ("online" in user) {
					let country = user.country ? `:flag_${user.country.toLowerCase()}: ` : ""
					return `The user  **${country}${user.name}**  was successfully linked to your Discord account.`
				}
				return `The user  **:flag_${user.region.toLowerCase()}: ${user.username}**  was successfully linked to your Discord account.`
			},
		},
		tracking: {
			error: (error: string) => `An error occurred.\n> ${error}`,
			no_user: "The user does not exist.",
			already_in: (user: NewDroidUser) => `The user  **:flag_${user.region.toLowerCase()}: ${user.username}**  is already being tracked.`,
			double_user: (user: NewDroidUser) => `You already have a profile in the system for this server:  **:flag_${user.region.toLowerCase()}: ${user.username}** \n> Use \`/tracking droid delete\` first.`,
			not_yours: (user: NewDroidUser) => `You can't delete  **:flag_${user.region.toLowerCase()}:  ${user.username}**  from the score tracking system of this server (You're not the owner or you don't have enough permissions).`,
			success: (user: NewDroidUser) => `The user  **:flag_${user.region.toLowerCase()}: ${user.username}** was successfully added to the  <:droid_simple:1021473577951821824>  **osu!droid**  score tracking system of this server.`,
			not_found: (user: NewDroidUser) => `The user  **:flag_${user.region.toLowerCase()}: ${user.username}**  wasn't found in the score tracking system of this server.`,
			deleted: (user: NewDroidUser) => `The user  **:flag_${user.region.toLowerCase()}: ${user.username}**  was deleted from the  <:droid_simple:1021473577951821824>  **osu!droid**  score tracking system of this server.`,
		}
	},
	error: {
		no_user: "The user does not exist.",
		general: "An error has ocurred.",
		no_params: "You must provide at least one of the following parameters: UID, username, or Discord user.",
		no_linked: "You don't have a linked osu!droid account. Use \`/userbind\`.",
		mention_no_linked: (user: string) => `<@${user}> doesn't have a linked account through \`/userbind\`.`,
	}
}