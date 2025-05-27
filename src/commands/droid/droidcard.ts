import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { unlinkSync } from "fs"
import { droid as droidModule  } from "osu-droid-scraping"
import { DroidScore, DroidUser as OldDroidUser } from "../../functions/osu!droid/types"

import en from "../../locales/en"
import es from "../../locales/es"
import { utils } from "../../utils"
import { DroidBanchoUser } from "miko-modules"
const languages = { en, es };

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("droidcard")
		.setDescription("osu!droid - (BETA) Generates a card with an osu!droid profile details.")
		.setDescriptionLocalization("es-ES", "osu!droid - (BETA) Genera una tarjeta con los datos de un perfil de osu!droid.")
		.addIntegerOption(opt => opt
			.setName("uid")
			.setDescription("UID of the osu!droid profile.").setDescriptionLocalization("es-ES", "UID del perfil de osu!droid.")
		)
		.addStringOption(opt => opt
			.setName("username")
			.setDescription("Username of the osu!droid profile.").setDescriptionLocalization("es-ES", "UID del perfil de osu!droid.")
		)
		.addUserOption(opt => opt
			.setName("user")
			.setDescription("Discord user bound to the osu!droid profile.").setDescriptionLocalization("es-ES", "Usuario de Discord vinculado al perfil de osu!droid.")
		),

	async execute(client, interaction) {

		const spanish = ["es-ES", "es-419"].includes(interaction.locale)
		let response = spanish ? languages.es : languages.en
		const reply = await interaction.deferReply()
		let user: DroidBanchoUser | undefined
		try { 
			user = await droid.get_droid_user(interaction, "ibancho") as DroidBanchoUser | undefined;
		} catch(error: any) {
			const embed = utils.embeds.error({ description: error.message, interaction, spanish });
			return await reply.edit({
				embeds: [embed]
			});
		}

		if (!user) return await reply.edit({
			embeds: [utils.embeds.error({ description: response.command.card.no_user, interaction, spanish })]
		})
		let scores: DroidScore[] = []
		const user_old = (await droid.user({ uid: user.id }))! as OldDroidUser
		const scores_fetch = await droidModule.scores({ uid: user.id, type: "top" }) as DroidScore[]
		for (const score of scores_fetch) {
			scores.push({
				...score,
				beatmap: undefined,
				color: "#dedede"
			})
		}

		const embed_wait = new EmbedBuilder()
			.setColor(0xdedede)
			.setDescription(response.command.card.generating(user))

		await reply.edit({ embeds: [embed_wait] })

		const embed_card = await droid.embed.card(user_old, scores)
		const attachment = new AttachmentBuilder(`./${user.id}-${user.username}.png`, { name: `${user.id}-${user.username}.png` });

		await reply.edit({ embeds: [embed_card], files: [attachment] })
		unlinkSync(`./${user.id}-${user.username}.png`)
	},
}
