import { DroidRXUser, DroidBanchoUser, DroidUser } from "miko-modules";
import { DroidTrackingUser } from "../schemas/types";
import { osu } from "../functions/osu/functions";
import { UsersDetailsResponse } from "osu-api-extended/dist/types/v2/users_details";
import { Modes_names } from "osu-api-extended";

export default {
	command: {
		calculate: {
			no_cache: "No hay ningún beatmap en la caché.",
			no_beatmap: "El beatmap no existe.",
		},
		card: {
			error: (error: string) => `\`\`\`diff\n- Ha ocurrido un error.\n\`\`\`\n> ${error}`,
			no_params: `Debes proporcionar un usuario para generar una tarjeta de perfil.`,
			no_link: "No tienes una cuenta de osu!droid vinculada. Usa \`/userbind\`.",
			mention_no_link: (user: string) => `<@${user}> no tiene una cuenta vinculada mediante \`/userbind\`.`,
			no_user: "El usuario no existe.",
			generating: (user: DroidUser) => `> <:droid_simple:1021473577951821824>  **osu!droid・**Creando tarjeta de perfil de  **${user.toString()}...**`
		},
		osucard: {
			error: (error: string) => `\`\`\`diff\n- Ha ocurrido un error.\n\`\`\`\n> ${error}`,
			generating: (user: UsersDetailsResponse, mode: Modes_names) => `> **${osu.gamemode.full(mode)} ・**Creando tarjeta de perfil de  **${user.username}**...`
		},
		recent: {
			error: (error: string) => `\`\`\`diff\n- Ha ocurrido un error.\n\`\`\`\n> ${error}`,
			no_params: `Debes proporcionar un usuario para obtener sus scores recientes.`,
			no_link: `No tienes una cuenta de osu!droid vinculada. Usa \`/userbind\`.`,
			mention_no_link: (user: string) => `<@${user}> no tiene una cuenta vinculada mediante \`/userbind\`.`,
			no_user: "El usuario no existe.",
			no_scores: (user: DroidUser) => `El usuario  **${user.toString()}** no tiene scores registrados.`,
			score: (user: DroidUser, index: number, penalty?: boolean) =>{
				if (user instanceof DroidRXUser) return `<:droid_simple:1021473577951821824>  **osu!droid・**Score reciente #${index + 1} de  **${user.toString()}**:`
				return `<:droid_simple:1021473577951821824>  **osu!droid・**Score reciente #${index + 1} de  **${user.toString()}**:\n${penalty ? "-# :warning: Se detectaron penalizaciones." : ""}`		
			}
		},
		top: {
			error: (error: string) => `Ha ocurrido un error.\n> ${error}`,
			no_params: `Debes proporcionar un usuario para obtener sus mejores scores.`,
			no_link: `No tienes una cuenta de osu!droid vinculada. Usa \`/userbind\`.`,
			mention_no_link: (user: string) => `<@${user}> no tiene una cuenta vinculada mediante \`/userbind\`.`,
			no_user: "El usuario no existe.",
			no_scores: (user: DroidUser) => `El usuario  **${user.toString()}** no tiene scores registrados.`,
		},
		userbind: {
			error: (error: string) => `Ha ocurrido un error.\n> ${error}`,
			no_params: "Debes proporcionar al menos uno de los siguientes parámetros: UID o nombre de usuario.",
			no_user: "El usuario no existe.",
			linked: (user: DroidUser) => `El usuario  **${user.toString()}**  fue vinculado exitosamente a tu cuenta de Discord.`,
		},
		tracking: {
			error: (error: string) => `Ha ocurrido un error.\n> ${error}`,
			no_user: "El usuario no existe.",
			already_in: (user: DroidUser) => `El usuario  **${user.toString()}**  ya está siendo rastreado.`,
			double_user: (user: DroidUser) => `Ya tienes un perfil en el sistema para este servidor:  **${user.toString()}** \n> Usa \`/tracking droid delete\` primero.`,
			not_yours: (user: DroidUser) => `No puedes eliminar a  **${user.toString()}**  del sistema de seguimiento de puntuaciones de este servidor (no eres el propietario o no tienes suficientes permisos).`,
			success: (user: DroidUser) => `El usuario  **${user.toString()}** fue añadido exitosamente al sistema de seguimiento de puntuaciones de  <:droid_simple:1021473577951821824>  **osu!droid**  en este servidor.`,
			not_found: (user: DroidUser) => `El usuario  **${user.toString()}**  no fue encontrado en el sistema de seguimiento de puntuaciones de este servidor.`,
			deleted: (user: DroidUser) => `El usuario  **${user.toString()}**  fue eliminado del sistema de seguimiento de puntuaciones de  <:droid_simple:1021473577951821824>  **osu!droid**  en este servidor.`,
		},
		server: {
			error: (error: string) => `Ha ocurrido un error.\n> ${error}`,
			success_bancho: () => `Tu servidor predeterminado ahora es iBancho.`,
			success_rx: () => `Tu servidor predeterminado ahora es osudroid!relax.`,
		}
	},
	error: {
		no_user: "El usuario no existe.",
		general: "Ha ocurrido un error.",
		no_params: "Debes proporcionar al menos uno de los siguientes parámetros: UID, nombre de usuario o usuario de Discord.",
		no_linked: "No tienes una cuenta de osu!droid vinculada. Usa \`/userbind\`.",
		mention_no_linked: (user: string) => `<@${user}> no tiene una cuenta vinculada mediante \`/userbind\`.`,
	}
}
