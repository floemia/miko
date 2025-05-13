import { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { card } from "@floemia/osu-profile-card"
import en from "../../locales/en"
import es from "../../locales/es"
import { utils } from "../../utils"
import { Modes_names, v2 } from "osu-api-extended"
import { UsersDetailsResponse } from "osu-api-extended/dist/types/v2/users_details"
import { osu } from "../../functions/osu/functions"
const languages = { en, es };
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("osucard")
		.setDescription("osu! - (BETA, NOT FINAL DESIGN) Generates a card with an osu! profile details.")
		.setDescriptionLocalization("es-ES", "osu! - (BETA, DISEÑO NO FINAL) Genera una tarjeta con los datos de un perfil de osu!")
		.addStringOption(opt => opt
			.setName("username")
			.setRequired(true)
			.setDescription("Username of the osu! profile.").setDescriptionLocalization("es-ES", "UID del perfil de osu!.")
		)
		.addStringOption(opt => opt
			.setName("mode")
			.setDescription("Playmode (Default = osu!)").setDescriptionLocalization("es-ES", "Modo de juego (Por defecto = osu!)")
			.addChoices(
				{ name: "osu!", value: "osu" },
				{ name: "osu!taiko", value: "taiko" },
				{ name: "osu!catch", value: "fruits" },
				{ name: "osu!mania", value: "mania" },
			)
		),

	async execute(client, interaction) {

		const spanish = ["es-ES", "es-419"].includes(interaction.locale)
		let response = spanish ? languages.es : languages.en
		const reply = await interaction.deferReply()
		const username = interaction.options.getString("username", true)
		let mode = (interaction.options.getString("mode") || "osu") as Modes_names
		let user: UsersDetailsResponse
		try {
			user = await v2.users.details({ user: username, mode: mode })
		} catch(error: any) {
			const embed = utils.embeds.error({ description: error.message, interaction, spanish });
			return await reply.edit({
				embeds: [embed]
			});
		}
		const scores = await v2.scores.list({ user_id: user.id, mode: mode, type: "user_best"})
		const embed_wait = new EmbedBuilder()
			.setColor(0xdedede)
			.setDescription(response.command.osucard.generating(user, mode))
		await reply.edit({ embeds: [embed_wait] });

		const osucard = await card({user: user, scores: scores})
		const embed_card = await osu.embed.card(user, mode);
		
		const attachment = new AttachmentBuilder(osucard, { name: `${user.id}.png` });

		await reply.edit({ embeds: [embed_card], files: [attachment] })
	},
}
