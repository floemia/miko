import { SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { embed } from "../../functions/messages/embeds"
import DroidUserBindModel from "../../schemas/osudroid-userbind"
import { miko, NewDroidUser, NewDroidResponse } from "miko-modules"
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
		let user: NewDroidUser | { error: string }
		let data: NewDroidResponse | { error: string }
		await interaction.deferReply()
		if (!uid && !username) {
			return await interaction.editReply({
				embeds: [embed.response({
					type: "error",
					description: spanish ? `Debes especificar un UID o un nombre de usuario.` :
						`You must specify an UID or an username.`,
					interaction: interaction
				})]
			})
		} else {
			data = await miko.request({ uid: uid || undefined, username: username || undefined })
			if ("error" in data) return await interaction.editReply({
				embeds: [embed.response({ type: "error", description: spanish ? `Ocurrió un error.\n\n\`\`\`${data.error}\`\`\`` : `An error occurred.\n\n\`\`\`${data.error}\`\`\``, interaction: interaction })]
			})
			user = (await miko.user({ response: data }))!
		}

		if ("error" in user) return await interaction.editReply({
			embeds: [embed.response({ type: "error", description: spanish ? `Ocurrió un error.\n\n\`\`\`${user.error}\`\`\`` : `An error occurred.\n\n\`\`\`${user.error}\`\`\``, interaction: interaction })]
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
					`El usuario  **:flag_${user.region.toLowerCase()}: ${user.username}**  de  <:droid_simple:1021473577951821824>  **osu!droid**  se vinculó correctamente a tu cuenta de Discord.`
					: `The user  **:flag_${user.region.toLowerCase()}: ${user.username}**  from  <:droid_simple:1021473577951821824>  **osu!droid**  was successfully linked to your Discord account.`,
				interaction: interaction
			}).setThumbnail(user.avatar_url)]
		})
	}
}