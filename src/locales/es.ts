import { DroidUser } from "@floemia/osu-droid-utils";
import { client } from "@root";
import { TimeHelper } from "@utils/helpers/TimeHelper";
import { Localization } from "./Localization";
import { DroidHelper, EmojiHelper } from "@utils/helpers";

const cute_emoji = "<:miko01:1417587405124403280>";

export const es: Localization = {
	general: {
		disabled: "Este comando está temporalmente deshabilitado.",
		error: "Ocurrió un error.",
		cooldown: (time: number) => `¡Estás yendo muy rápido! Espera \`${time.toFixed(2)}s\`.`,
		user_dne: "Ese usuario no existe.",
		no_scores: (user: DroidUser) => `El usuario ${DroidHelper.userToString(user, false)} no tiene scores.`,
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
			generating: (user: DroidUser) => `${cute_emoji} | Obteniendo scores recientes de ${DroidHelper.userToString(user, false)}...`,
			message: (user: DroidUser, index: number) => `${cute_emoji} | Score reciente #${index + 1} de  **${DroidHelper.userToString(user, false)}:**${client.config.scraping ? `\n-# ${es.general.scraping}` : ``}`,
		},
		link: {
			success: (user: DroidUser) => `Tu cuenta de Discord ha sido vinculada a  **${DroidHelper.userToString(user, false)}**.`,
		},
		top: {
			generating: (user: DroidUser) => `${cute_emoji}・Obteniendo top scores de  **${DroidHelper.userToString(user, false)}**...`,
			title: "Top 50 scores"
		},
		uptime: {
			response: (uptime: number) => `El tiempo de actividad de Miko es de \`${TimeHelper.msToTime(uptime)}\`.`,
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
			generating: (user: DroidUser) => `${cute_emoji} | Generando tarjeta de perfil de  **${DroidHelper.userToString(user, false)}**...`,
		},
		recent50: {
			generating: (user: DroidUser) => `${cute_emoji} | Obteniendo los 50 scores más recientes de  **${DroidHelper.userToString(user, false)}**...`,
			title: "50 últimos scores"
		}
	},
	tracking: {
		message: (user: DroidUser) => `${cute_emoji} | Score reciente de  **${DroidHelper.userToString(user, false)}:**${client.config.scraping ? `\n-# ${es.general.scraping}` : ``}`,
	}
}