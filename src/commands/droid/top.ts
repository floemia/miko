import { ButtonInteraction, ComponentType, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { create_row } from "../../functions/utils"
import { DroidBanchoScore, DroidBanchoUser, DroidRXScore, DroidRXUser } from "miko-modules"
import en from "../../locales/en"
import es from "../../locales/es"
import { utils } from "../../utils"
import DiscordUserDefaultServerModel from "../../schemas/DiscordUserDefaultServerSchema"
const languages = { en, es };
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
		)
		.addStringOption(opt => opt
			.setName("server")
			.setDescription("The server to fetch the information from. Defaults to iBancho.").setDescriptionLocalization("es-ES", "El servidor desde el cual conseguir la información. Por defecto, iBancho.")
			.addChoices(
				{ name: "iBancho", value: "ibancho" },
				{ name: "osudroid!relax", value: "rx" },
			)
		),
	async execute(client, interaction) {
		const spanish = ["es-ES", "es-419"].includes(interaction.locale)
		let response = spanish ? languages.es : languages.en
		const reply = await interaction.deferReply()		
		let server = interaction.options.getString("server") || undefined;
		if (!server) {
			let server_db = await DiscordUserDefaultServerModel.findOne({ discord_id: interaction.user.id })
			if (server_db) {
				server = server_db.server
			} else server = "ibancho"
		}
		let user: DroidBanchoUser | DroidRXUser | undefined;
		try { 
			user = await droid.get_droid_user(interaction, server);
		} catch(error: any) {
			const embed = utils.embeds.error({ description: error.message, interaction, spanish });
			return await reply.edit({
				embeds: [embed]
			});
		}
		if (!user) return await reply.edit({
			embeds: [utils.embeds.error({ description: response.command.recent.no_user, interaction, spanish })]
		})
		let top_plays: DroidBanchoScore[] | DroidRXScore[];
		try {
			top_plays = await user.scores.top()
		} catch(error: any) {
			const embed = utils.embeds.error({ description: error.message, interaction, spanish });
			return await reply.edit({
				embeds: [embed]
			});
		}
		if (!top_plays.length) return await reply.edit({
			embeds: [utils.embeds.error({ description: response.command.recent.no_scores(user), interaction, spanish })]
		})
		const unique = `${interaction.user.id}-${Math.floor(Math.random() * 10000000)}`
		let index = 0
		let max_pages = Math.ceil(top_plays.length / 5)
		const row = create_row(unique, index, max_pages);

		const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button });
		let collector_timeout: NodeJS.Timeout
		let scores = utils.pagination({ array: top_plays, page: index, elements_per_page: 5 })
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

				scores = await utils.pagination({ array: top_plays, page: index, elements_per_page: 5 })
				embed_top = await droid.embed.top(user, scores, index)

				await i.editReply({
					embeds: [embed_top],
					components: [row]
				})
			}
		})
		await interaction.editReply({
			embeds: [embed_top], components: [row]
		})
	},
}	