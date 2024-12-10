import { SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import { DroidUser } from "osu-droid-scraping"
import DroidUserBindModel from "../../schemas/osudroid-userbind"
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
		let uid = interaction.options.getInteger("uid")
		let username = interaction.options.getString("username")
		let user: DroidUser | undefined
		await interaction.deferReply()
		if (uid) {
			user = await droid.user({ uid: uid })
		} else if (username) {
			uid = await droid.get_uid(username) || null
			if (uid) user = await droid.user({ uid: uid })
		} else {
			return await interaction.editReply({
				embeds: [embed.response({
					type: "error",
					description: spanish ? `Debes ingresar al menos un parámetro.` : "You must pass at least one parameter.",
					interaction: interaction
				})]
			})
		}
		if (!user) return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: spanish ? `El usuario no existe.` : "User does not exist.",
				interaction: interaction
			})]
		})

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
				description: spanish ?
					`El usuario  **:flag_${user.country.toLowerCase()}: ${user.username}**  de  <:droid_simple:1021473577951821824>  **osu!droid**  se vinculó correctamente a tu cuenta de Discord.`
					: `The user  **:flag_${user.country.toLowerCase()}: ${user.username}**  from  <:droid_simple:1021473577951821824>  **osu!droid**  was successfully linked to your Discord account.`,
				interaction: interaction
			}).setThumbnail(user.avatar_url)]
		})
	}
}