import { SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { embed } from "../../functions/messages/embeds"
import DroidUserBindModel from "../../schemas/DroidUserBindSchema"
import { miko, NewDroidUser, NewDroidResponse } from "miko-modules"
import en from "../../locales/en"
import es from "../../locales/es"
const languages = { en, es };

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("userbind")
		.setDescription("osu!droid - Binds an osu!droid account to your Discord account.")
		.setDescriptionLocalization("es-ES", "osu!droid - Vincular una cuenta de osu!droid a tu cuenta de Discord.")
		.addIntegerOption(opt => opt
			.setName("uid")
			.setDescription("UID of osu!droid profile.").setDescriptionLocalization("es-ES", "UID del perfil de osu!droid.")
		)
		.addStringOption(opt => opt
			.setName("username").setNameLocalization("es-ES", "indice")
			.setDescription("Username of the osu!droid profile").setDescriptionLocalization("es-ES", "Username del perfil de osu!droid.")
		),

	async execute(client, interaction) {
		const spanish = ["es-ES", "es-419"].includes(interaction.locale)
		let response = spanish ? languages.es : languages.en
		let uid = interaction.options.getInteger("uid")
		let username = interaction.options.getString("username")
		let user: NewDroidUser
		await interaction.deferReply()
		if (!uid && !username) {
			return await interaction.editReply({
				embeds: [embed.response({
					type: "error",
					description: response.command.userbind.no_params,
					interaction: interaction
				})]
			})
		}

		let data = await miko.request({ uid: uid || undefined, username: username || undefined })
		if ("error" in data) return await interaction.editReply({
			embeds: [embed.response({ type: "error", description: response.command.userbind.error(data.error), interaction: interaction })]
		})

		user = await miko.user({ response: data }) as NewDroidUser
		const user_in_db = await DroidUserBindModel.findOne({ discord_id: interaction.user.id })
		if (!user_in_db) {
			new DroidUserBindModel({
				username: user.username,
				uid: user.id,
				avatar_url: user.avatar_url,
				discord_id: interaction.user.id
			}).save()
		} else {
			await DroidUserBindModel.updateOne(
				{ discord_id: interaction.user.id },
				{
					"$set": {
						username: user.username,
						uid: user.id,
						avatar_url: user.avatar_url,
					}
				})
		}

		await interaction.editReply({
			embeds: [embed.response({
				type: "success",
				description: response.command.userbind.linked(user),
				interaction: interaction
			}).setThumbnail(user.avatar_url)]
		})
	}
}