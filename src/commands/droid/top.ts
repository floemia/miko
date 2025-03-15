import { ButtonInteraction, ComponentType, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import { create_row } from "../../functions/utils"
import DroidUserBindModel from "../../schemas/osudroid-userbind"
import { DroidScoreExtended, miko, NewDroidUser } from "miko-modules"
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("top")
		.setDescription("osu!droid - Get top plays from an osu!droid profile.")
		.setDescriptionLocalization("es-ES", "osu!droid - Obtener top plays de un perfil de osu!droid.")
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
			const response = await interaction.deferReply()
			let id = interaction.options.getInteger("uid")
			let username = interaction.options.getString("username")
			let discord_user = interaction.options.getUser("user")
			let top: DroidScoreExtended[] | undefined
			let user: NewDroidUser | undefined
			if (!id && !username && !discord_user) {
				let db_get = await DroidUserBindModel.findOne({ discord_id: interaction.user.id })
				if (!db_get)
					return await interaction.editReply({
						embeds: [embed.response({
							type: "error",
							description: spanish ? `No tienes una cuenta de osu!droid vinculada. Usa \`/userbind\`.` :
								`You don't have a linked osu!droid account. Use \`/userbind\`.`,
							interaction: interaction
						})]
					})
				else id = db_get.uid
			}
			if (!id && !username && discord_user) {
				let db_get = await DroidUserBindModel.findOne({ discord_id: discord_user.id })
				if (!db_get) return await interaction.editReply({
					embeds: [embed.response({
						type: "error",
						description: spanish ? `<@${discord_user.id}> no tiene una cuenta vinculada por \`/userbind\`.` :
							`<@${discord_user.id}> doesn't have a linked account through \`/userbind\`.`,
						interaction: interaction
					})]
				})
				else id = db_get.uid

			}
			if (id || username) {
				top = await miko.scores({ uid: id || undefined, username: username || undefined, type: "top" })
				if (!top) return await interaction.editReply({
					embeds: [embed.response({
						type: "error",
						description: spanish ? `El usuario no existe.` : "User not found.",
						interaction: interaction
					})]
				})
			}

			if (!top || !top.length) return await interaction.editReply({
				embeds: [embed.response({
					type: "error",
					description: spanish ? `El usuario no ha subido ningún score.` :
						`The user has no submitted scores.`,
					interaction: interaction
				})]
			})
			user = top[0].user!

			const unique = `${interaction.user.id}-${Math.floor(Math.random() * 10000000)}`
			let index = 0
			let max_pages = Math.ceil(top.length / 5)
			const row = create_row(unique, index, max_pages);

			const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button });
			let collector_timeout: NodeJS.Timeout
			let scores = await miko.score_pagination({ scores: top, page: index, scores_per_page: 5 })
			let embed_top = await droid.embed.top(user, scores, index)
			const start_timeout = () => {
				collector_timeout = setTimeout(() => {
					collector.stop()
					for (const button of row.components) {
						button.setDisabled(true)
					}
					interaction.editReply({ components: [row] })
				}, 120000)
			}

			const reset_timeout = async () => {
				clearTimeout(collector_timeout)
				start_timeout()
			}

			start_timeout()
			collector.on("collect", async (i: ButtonInteraction) => {
				if (i.user.id == interaction.user.id) {
					await i.deferUpdate()
					switch (i.customId) {
						case (`backAll-${unique}`):
							index = 0
							break;
						case (`back-${unique}`):
							index--;
							if (index < 0) index = max_pages - 1
							break;
						case (`go-${unique}`):
							index++;
							if (index >= max_pages) index = 0
							break;
						case (`goAll-${unique}`):
							index = max_pages - 1;
							break;
					}
					reset_timeout()

					row.components[0].setDisabled(index == 0 ? true : false)
					row.components[2].setLabel(`${index + 1}/${max_pages}`)
					row.components[4].setDisabled(index == max_pages - 1 ? true : false)

					scores = await miko.score_pagination({ scores: top, page: index, scores_per_page: 5 })
					embed_top = await droid.embed.top(user, scores, index)

					await i.editReply({
						// content: spanish ?
						// 	`<:droid_simple:1021473577951821824>  **osu!droid・**Top play #${index + 1} de  :flag_${user.region.toLowerCase()}:  **${user.username}**:\n${top[index].performance.penalty ? "-# :warning: Algunas penalizaciones fueron encontradas." : ""}`
						// 	: `<:droid_simple:1021473577951821824>  **osu!droid・**Top play #${index + 1} from  :flag_${user.region.toLowerCase()}:  **${user.username}**:\n${top[index].performance.penalty ? "-# :warning: Some penalties were found." : ""}`,
						embeds: [embed_top],
						components: [row]
					})
				}
			})
			await interaction.editReply({
				// content: spanish ?
				// `<:droid_simple:1021473577951821824>  **osu!droid・**Top play #${index + 1} de  :flag_${user.region.toLowerCase()}:  **${user.username}**:\n${top[index].performance.penalty ? "-# :warning: Algunas penalizaciones fueron encontradas." : ""}`
				// : `<:droid_simple:1021473577951821824>  **osu!droid・**Top play #${index + 1} from  :flag_${user.region.toLowerCase()}:  **${user.username}**:\n${top[index].performance.penalty ? "-# :warning: Some penalties were found." : ""}`,
				embeds: [embed_top], components: [row]
			})
		},
	}	