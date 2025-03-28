import { SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import { miko } from "miko-modules"
import { urlStorage } from "../../events/client/message"
import { MapInfo } from "@rian8337/osu-base"
import { DroidMods } from "osu-droid-scraping"
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("calculate")
		.setDescription("osu!droid - (BETA) Calculates the values of performance and difficulty of a beatmap.")
		.setDescriptionLocalization("es-ES", "osu!droid - Calcula los valores de rendimiento y dificultad de un beatmap.")
		.addIntegerOption(opt => opt
			.setName("beatmap")
			.setDescription("URL of the beatmap. Defaults to latest beatmap in cache.")
			.setDescriptionLocalization("es-ES", "URL del beatmap. Por defecto, el beatmap más reciente en la cache.")
		)
		.addStringOption(opt => opt
			.setName("mods")
			.setDescription("Applied modifiers (i.e. HDHR). Defaults to No Mod.")
			.setDescriptionLocalization("es-ES", "Modificadores aplicados (por ejemplo, HDHR). Por defecto, No Mod.")
		)
		.addNumberOption(opt => opt
			.setName("accuracy")
			.setDescription("Accuracy obtained, from 0 to 100. Defaults to 100.")
			.setDescriptionLocalization("es-ES", "Precisión obtenida, de 0 a 100. Por defecto, 100.")
			.setMinValue(0).setMaxValue(100)
		)
		.addNumberOption(opt => opt
			.setName("combo")
			.setDescription("Combo obtained. Defaults to FC.")
			.setDescriptionLocalization("es-ES", "Combo obtenido, de 0 a 100. Por defecto, FC.")
			.setMinValue(0)
		)
		.addIntegerOption(opt => opt
			.setName("x100")
			.setDescription("Number of 100s obtained. Defaults to 0.")
			.setDescriptionLocalization("es-ES", "Número de 100 obtenidos. Por defecto, 0.")
			.setMinValue(0)
		)
		.addIntegerOption(opt => opt
			.setName("x50")
			.setDescription("Number of 50s obtained. Defaults to 0.")
			.setDescriptionLocalization("es-ES", "Número de 50 obtenidos. Por defecto, 0.")
			.setMinValue(0)
		)
		.addIntegerOption(opt => opt
			.setName("misses")
			.setDescription("Number of misses obtained. Defaults to 0.")
			.setDescriptionLocalization("es-ES", "Número de fallos obtenidos. Por defecto, 0.")
			.setMinValue(0)
		)
		.addNumberOption(opt => opt
			.setName("speed")
			.setDescription("Speed multiplier, from 0.5x to 2x. Defaults to 1x.")
			.setDescriptionLocalization("es-ES", "Multiplicador de velocidad, de 0.5x a 2x. Por defecto, 1x.")
			.setMinValue(0.5).setMaxValue(2)
		),
	async execute(client, interaction) {
		await interaction.deferReply()
		const spanish = ["es-ES", "es-419"].includes(interaction.locale)
		let storage = urlStorage.get(interaction.channelId)
		let beatmap_value = interaction.options.getString("url") || storage
		if (beatmap_value?.includes("::")) beatmap_value = beatmap_value.split("::")[0]
		if (beatmap_value?.includes("#osu/")) beatmap_value = beatmap_value.split("#osu/")[1]
		if (!beatmap_value) return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: spanish ? `No hay un beatmap en la cache.` :
					`There is no beatmap in the cache.`,
				interaction: interaction
			})]
		})
		let mods: DroidMods = {
			speed: interaction.options.getNumber("speed") || 1,
			acronyms: (interaction.options.getString("mods") || "").match(/.{1,2}/g)?.map(mod => mod.toUpperCase()) || [],
		}
		let beatmap = await MapInfo.getInformation(Number(beatmap_value))
		if (!beatmap) return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: spanish ? `El beatmap no existe.` :
					`The beatmap does not exist.`,
				interaction: interaction
			})]
		})

		let accuracy = interaction.options.getNumber("accuracy")
		let combo = interaction.options.getInteger("combo")

		let n50 = accuracy ? -1 : interaction.options.getInteger("x50") || 0
		let n100 = accuracy ? -1 : interaction.options.getInteger("x100") || 0
		let n300 = accuracy ? -1 : beatmap.objects - n100 - n50
		let nMiss = interaction.options.getInteger("misses") || 0
		let data = await miko.performance({
			accuracy: accuracy || undefined,
			combo: combo || undefined,
			beatmap: beatmap,
			mods: mods,
			count: {
				n300: n300,
				n100: n100,
				n50: n50,
				nMiss: nMiss,
				nGeki: 0,
				nKatu: 0,
			},
		})
		await interaction.editReply({
			embeds: [await droid.embed.calculate(data)]
		})
	}
}