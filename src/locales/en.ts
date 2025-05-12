import { DroidRXUser, DroidBanchoUser, DroidUser } from "miko-modules";
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
			generating: (user: DroidUser) => `> <:graycheck:903741976061567027> <:droid_simple:1021473577951821824>  **osu!droid・**Creating profile card of  **${user.toString()}...**`
		},
		recent: {
			error: (error: string) => `\`\`\`diff\n- An error has occured.\n\`\`\`\n> ${error}`,
			no_params: `You must provide an user to get recent scores from.`,
			no_link: `You don't have a linked osu!droid account. Use \`/userbind\`.`,
			mention_no_link: (user: string) => `<@${user}> doesn't have a linked account through \`/userbind\`.`,
			no_user: "The user does not exist.",
			no_scores: (user: DroidUser) => `The user  **${user.toString()}** has no submitted scores.`,
			score: (user: DroidUser, index: number, penalty?: boolean) =>{
				if (user instanceof DroidRXUser) return `<:droid_simple:1021473577951821824>  **osu!droid・**Recent score #${index + 1} from  **${user.toString()}**:`
				return `<:droid_simple:1021473577951821824>  **osu!droid・**Recent score #${index + 1} from  **${user.toString()}**:\n${penalty ? "-# :warning: Some penalties were found." : ""}`		
			}
		},
		top: {
			error: (error: string) => `An error occurred.\n> ${error}`,
			no_params: `You must provide an user to get top scores from.`,
			no_link: `You don't have a linked osu!droid account. Use \`/userbind\`.`,
			mention_no_link: (user: string) => `<@${user}> doesn't have a linked account through \`/userbind\`.`,
			no_user: "The user does not exist.",
			no_scores: (user: DroidUser) => `The user  **${user.toString()}** has no submitted scores.`,
		},
		userbind: {
			error: (error: string) => `An error occurred.\n> ${error}`,
			no_params: "You must provide at least one of the following parameters: UID or username",
			no_user: "The user does not exist.",
			linked: (user: DroidUser) => `The user  **${user.toString()}**  was successfully linked to your Discord account.`,
		},
		tracking: {
			error: (error: string) => `An error occurred.\n> ${error}`,
			no_user: "The user does not exist.",
			already_in: (user: DroidUser) => `The user  **${user.toString()}**  is already being tracked.`,
			double_user: (user: DroidUser) => `You already have a profile in the system for this server:  **${user.toString()}** \n> Use \`/tracking droid delete\` first.`,
			not_yours: (user: DroidUser) => `You can't delete  **${user.toString()}**  from the score tracking system of this server (You're not the owner or you don't have enough permissions).`,
			success: (user: DroidUser) => `The user  **${user.toString()}** was successfully added to the  <:droid_simple:1021473577951821824>  **osu!droid**  score tracking system of this server.`,
			not_found: (user: DroidUser) => `The user  **${user.toString()}**  wasn't found in the score tracking system of this server.`,
			deleted: (user: DroidUser) => `The user  **${user.toString()}**  was deleted from the  <:droid_simple:1021473577951821824>  **osu!droid**  score tracking system of this server.`,
		},
		server: {
			error: (error: string) => `An error occurred.\n> ${error}`,
			success_bancho: () => `Your default server has been set to iBancho.`,
			success_rx: () => `Your default server has been set to osudroid!relax.`,
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