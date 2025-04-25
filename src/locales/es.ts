export default {
	command: {
		calculate: {
			no_cache: "No hay un beatmap en la cache.",
			no_beatmap: "El beatmap no existe.",
		},
		card: {
			no_link: "No tienes una cuenta de osu!droid vinculada. Usa \`/userbind\`.",
			mention_no_link: (user: string) => `<@${user}> no tiene una cuenta vinculada por \`/userbind\`.`,
			error: (error: string) => `Ocurrió un error.\n\n\`\`\`${error}\`\`\``,
			no_user: "El usuario no existe.",
		},
	},	
}