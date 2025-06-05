import { Misc } from "@utils";
import { DroidUser } from "miko-modules";

export const es = {
	general: {
		error: "Ocurrió un error.",
		cooldown: (time: number) => `¡Estás yendo muy rápido! Espera \`${time.toFixed(2)}s\`.`,
		user_dne: "Ese usuario no existe.",
		no_scores: (user: DroidUser) => `El usuario ${user.toString()} no tiene scores.`,
	},
	commands: {
		ping: {
			response: (ping: number) => `El ping es \`${ping.toFixed(2)}ms\`.`,
		},
		recent: {
			generating: (user: DroidUser) => `Obteniendo scores recientes de ${user.toString()}...`,
			no_scores: (user: DroidUser) => `El usuario ${user.toString()} no tiene scores.`,
			message: (user: DroidUser, index: number) => `<:droid_simple:1021473577951821824>  **osu!droid・**Score reciente #${index + 1} de  **${user.toString()}:**`,
		},
		userbind: {
			success: (user: DroidUser) => `Tu cuenta de Discord ha sido vinculada a ${user.toString()}.`,
		},
		top: {
			generating: (user: DroidUser) => `Obteniendo top scores de ${user.toString()}...`,
		},
		uptime: {
			response: (uptime: number) => `El tiempo de actividad de Miko es de \`${Misc.msToTime(uptime)}\`.`,
		}
	},
	tracking: {
		message: (user: DroidUser) => `<:droid_simple:1021473577951821824>  **osu!droid・**Score reciente de  **${user.toString()}:**`
	}
}