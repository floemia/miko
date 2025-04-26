import { DroidRXUser, NewDroidUser } from "miko-modules";
import { DroidUser } from "../functions/osu!droid/types";
import { DroidTrackingUser } from "../schemas/types";

export default {
	command: {
		calculate: {
			no_cache: "No hay un beatmap en la cache.",
			no_beatmap: "El beatmap no existe.",
		},
		card: {
			error: (error: string) => `Ocurrió un error.\n> ${error}`,
			no_link: "No tienes una cuenta de osu!droid vinculada. Usa \`/userbind\`.",
			no_params: `Debes especificar un usuario para generar una tarjeta de perfil.`,
			mention_no_link: (user: string) => `<@${user}> no tiene una cuenta vinculada por \`/userbind\`.`,
			no_user: "El usuario no existe.",
			generating: (user: DroidUser) => `> <:graycheck:903741976061567027> <:droid_simple:1021473577951821824>  **osu!droid・**Creando tarjeta de perfil de  :flag_${user.country.toLowerCase()}:  **${user.username}...**`
		},
		recent: {
			error: (error: string) => `Ocurrió un error.\n> ${error}`,
			no_params: `Debes especificar un usuario para obtener scores recientes.`,
			no_link: `No tienes una cuenta de osu!droid vinculada. Usa \`/userbind\`.`,
			mention_no_link: (user: string) => `<@${user}> no tiene una cuenta vinculada por \`/userbind\`.`,
			no_user: "El usuario no existe.",
			no_scores: (user: NewDroidUser) => `El usuario  **:flag_${user.region.toLowerCase()}: ${user.username}**  no ha subido ningún score.`,
			score: (user: NewDroidUser, index: number, penalty: boolean = false) => `<:droid_simple:1021473577951821824>  **osu!droid・**Score reciente #${index + 1} de  :flag_${user.region.toLowerCase()}:  **${user.username}**:\n${penalty ? "-# :warning: Algunas penalizaciones fueron encontradas." : ""}`
		},
		top: {
			error: (error: string) => `Ocurrió un error.\n> ${error}`,
			no_params: `Debes especificar un usuario para obtener las top plays.`,
			no_link: `No tienes una cuenta de osu!droid vinculada. Usa \`/userbind\`.`,
			mention_no_link: (user: string) => `<@${user}> no tiene una cuenta vinculada por \`/userbind\`.`,
			no_user: "El usuario no existe.",
			no_scores: (user: NewDroidUser) => `El usuario  **:flag_${user.region.toLowerCase()}: ${user.username}**  no ha subido ningún score.`,
		},
		userbind: {
			error: (error: string) => `Ocurrió un error.\n> ${error}`,
			no_params: "Debes proporcionar al menos uno de los siguientes parámetros: UID o nombre de usuario",
			no_user: "El usuario no existe.",
			linked: (user: NewDroidUser | DroidRXUser) => {
				if ("online" in user) return `El usuario  **:flag_${user.country.toLowerCase()}: ${user.name}**  se vinculó correctamente a tu cuenta de Discord.`
				return `El usuario  **:flag_${user.region.toLowerCase()}: ${user.username}**  se vinculó correctamente a tu cuenta de Discord.`
			},
		},
		tracking: {
			error: (error: string) => `Ocurrió un error.\n> ${error}`,
			no_user: "El usuario no existe.",
			already_in: (user: NewDroidUser) => `El usuario  **:flag_${user.region.toLowerCase()}: ${user.username}**  ya está en el sistema de tracking de este servidor.`,
			double_user: (user: NewDroidUser) => `Ya tienes un perfil en el sistema de tracking de este servidor:  **:flag_${user.region.toLowerCase()}: ${user.username}** \n> Utiliza el comando \`/tracking droid eliminar\` primero.`,
			not_yours: (user: NewDroidUser) => `No puedes eliminar a  **:flag_${user.region.toLowerCase()}:  ${user.username}**  del sistema del servidor (No eres el dueño o no tienes permisos suficientes).`,
			success: (user: NewDroidUser) => `El usuario  **:flag_${user.region.toLowerCase()}: ${user.username}** fue añadido al sistema de tracking de  <:droid_simple:1021473577951821824>  **osu!droid**  del servidor.`,
			not_found: (user: NewDroidUser) => `El usuario  **:flag_${user.region.toLowerCase()}: ${user.username}**  no fue encontrado en el sistema de tracking de este servidor.`,
			deleted: (user: NewDroidUser) => `El usuario  **:flag_${user.region.toLowerCase()}: ${user.username}**  fue eliminado del sistema de tracking de  <:droid_simple:1021473577951821824>  **osu!droid**  del servidor.`,
		},
	},
	error: {
		general: "Ocurrió un error.",
		no_user: "El usuario no existe.",
		no_params: "Debes proporcionar al menos uno de los siguientes parámetros: UID, nombre de usuario o usuario de Discord.",
		no_linked: "No tienes una cuenta de osu!droid vinculada. Usa \`/userbind\`.",
		mention_no_linked: (user: string) => `<@${user}> no tiene una cuenta vinculada por \`/userbind\`.`,
	}
}