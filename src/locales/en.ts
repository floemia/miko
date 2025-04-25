export default {
	command: {
		calculate: {
			no_cache: "There is no beatmap in the cache.",
			no_beatmap: "The beatmap does not exist.",
		},
		card: {
			no_link: "You don't have a linked osu!droid account. Use \`/userbind\`.",
			mention_no_link: (user: string) => `<@${user}> doesn't have a linked account through \`/userbind\`.`,
			error: (error: string) => `An error occurred.\n\n\`\`\`${error}\`\`\``,
			no_user: "The user does not exist.",
		}
	}
}