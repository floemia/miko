import { Misc } from "@utils";
import { DroidUser } from "miko-modules";
import { client } from "@root";
export const es = {
	general: {
		error: "Ocurrió un error.",
		cooldown: (time: number) => `¡Estás yendo muy rápido! Espera \`${time.toFixed(2)}s\`.`,
		user_dne: "Ese usuario no existe.",
		no_scores: (user: DroidUser) => `El usuario ${user.toString()} no tiene scores.`,
		dev_only: "Este comando solo está disponible para <@596481414426525696>.",
		scraping: "⚠️ Usando el método de web scraping! Pueden haber errores.",
		you_no_link: "No tienes una cuenta de osu!droid vinculada. Usa /link o especifica un usuario.",
		mention_no_link: "El usuario mencionado no tiene una cuenta de osu!droid vinculada.",
		api_broken: `El API está actualmente rota y el método de emergencia no soporta usernames. Por favor usa UIDs.`
	},
	commands: {
		ping: {
			response: (ping: number) => `El ping es \`${ping.toFixed(2)}ms\`.`,
		},
		recent: {
			generating: (user: DroidUser) => `Obteniendo scores recientes de ${user.toString()}...`,
			no_scores: (user: DroidUser) => `El usuario ${user.toString()} no tiene scores.`,
			message: (user: DroidUser, index: number) => `<:droid_simple:1021473577951821824>  **osu!droid・**Score reciente #${index + 1} de  **${user.toString()}:**${client.config.scraping ? `\n-# ${es.general.scraping}` : ``}`,
		},
		link: {
			success: (user: DroidUser) => `Tu cuenta de Discord ha sido vinculada a  ${user.toString()}.`,
		},
		top: {
			generating: (user: DroidUser) => `Obteniendo top scores de  ${user.toString()}...`,
		},
		uptime: {
			response: (uptime: number) => `El tiempo de actividad de Miko es de \`${Misc.msToTime(uptime)}\`.`,
		},
		config: {
			track_channel: {
				set: (channel: string, permission: boolean) => `El canal de tracking de scores de osu!droid ha sido establecido a ${channel}.${permission ? "" : "... **pero no tengo permisos para enviar mensajes en ese canal!**"}`,
			},
			track: {
				enabled: (status: boolean) => `El sistema de tracking de scores de osu!droid ha sido ${status ? "habilitado" : "deshabilitado"}.`,
			},
			prefix: {
				set: (prefix: string) => `El prefijo ha sido establecido a \`${prefix}\` para este servidor.`,
			}
		},
		defaultserver: {
			response: (server: string) => `Tu servidor predeterminado de osu!droid ahora es ${server}.`,
		},
		card: {
			generating: (user: DroidUser) => `Generando tarjeta de perfil de  ${user.toString()}...`,
		}
	},
	tracking: {
		message: (user: DroidUser) => `<:droid_simple:1021473577951821824>  **osu!droid・**Score reciente de  **${user.toString()}:**${client.config.scraping ? `\n-# ${es.general.scraping}` : ``}`,
	}
}