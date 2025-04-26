import { SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { embed } from "../../functions/messages/embeds"
import DroidUserBindModel from "../../schemas/DroidUserBindSchema"
import DroidRXUserBindModel from "../../schemas/DroidRXUserBindSchema"
import { miko, NewDroidUser, DroidRXUser } from "miko-modules"
import en from "../../locales/en"
import es from "../../locales/es"
import { utils } from "../../utils"
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
		)
		.addStringOption(opt => opt
			.setName("server")
			.setDescription("The server to bind the account to. Defaults to iBancho.").setDescriptionLocalization("es-ES", "El servidor al que vincular la cuenta. Por defecto, iBancho.")
			.addChoices(
				{ name: "iBancho", value: "ibancho" },
				{ name: "osudroid!relax", value: "rx" },
			)
		),

	async execute(client, interaction) {
		const spanish = ["es-ES", "es-419"].includes(interaction.locale)
		let response = spanish ? languages.es : languages.en
		let uid = interaction.options.getInteger("uid") || undefined
		let username = interaction.options.getString("username") || undefined
		let user: NewDroidUser | DroidRXUser
		await interaction.deferReply()
		let iBancho = (interaction.options.getString("server") || "ibancho") == "ibancho"
		if (!uid && !username) {
			return await interaction.editReply({
				embeds: [utils.embeds.error({ description: response.command.userbind.no_params, interaction: interaction, spanish: spanish })]
			})
		}

		if (iBancho) {
			let data = await miko.request({ uid: uid, username: username })
			if ("error" in data) return await interaction.editReply({
				embeds: [utils.embeds.error({ description: data.error, interaction: interaction, spanish: spanish })]
			})

			uid = data.UserId
			username = data.Username
			user = await miko.user({ response: data }) as NewDroidUser
		} else {
			let data = await miko.rx.user({ uid: uid, username: username })
			if ("error" in data) return await interaction.editReply({
				embeds: [utils.embeds.error({ description: `${data.error}`, interaction: interaction, spanish: spanish })]
			})

			uid = data.id
			username = data.name
			user = data
		}
		let db = iBancho ? DroidUserBindModel : DroidRXUserBindModel
		const user_in_db = await db.findOne({ discord_id: interaction.user.id })
		if (!user_in_db) {
			new db({
				username: username,
				uid: uid,
				discord_id: interaction.user.id
			}).save()
		} else {
			await db.updateOne(
				{ discord_id: interaction.user.id },
				{
					"$set": {
						username: username,
						uid: uid,
					}
				})
		}

		let avatar_url: string
		if ("avatar_url" in user) {
			avatar_url = user.avatar_url
		} else {
			try {
				fetch(`https://v4rx.me/user/avatar/${user.id}.png/`)
				avatar_url = `https://v4rx.me/user/avatar/${user.id}.png/`
			}
			catch (error) {
				avatar_url = "https://osudroid.moe/user/avatar/0.png"
			}
		}
		let server = iBancho ? "iBancho" : "osudroid!relax"
		let server_icon = iBancho ? `https://cdn.discordapp.com/icons/316545691545501706/a_2e882927641c2b4bb15e514d4e2829c7.webp` : `https://cdn.discordapp.com/icons/1095653998389907468/a_82bf78e259e9cb4ba4d4ca355e28e0df.webp`
		await interaction.editReply({
			embeds: [utils.embeds.success({ description: response.command.userbind.linked(user), interaction: interaction, spanish: spanish })
				.setThumbnail(avatar_url)
				.setFooter({ text: `Server: ${server}`, iconURL: server_icon })]
		})
	}
}