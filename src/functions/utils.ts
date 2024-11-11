import { getAverageColor } from "fast-average-color-node"
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"

export const average_color = async (url: string) => {
	try {
        const average = await getAverageColor(url)
        return average
    } catch(error) {
        return{
			rgb: "rgb(222,222,222)",
			rgba: "rgba(222,222,222,1)",
			hex: "#dedede",
			hexa: "#dededeff",
			value: [222,222,222,1],
			isDark: false,
			isLight: true,
		}
	}
}
export const create_row = (unique: string, index: number, length: number) => {
	return new ActionRowBuilder<ButtonBuilder>()
	.setComponents(
		new ButtonBuilder()
			.setCustomId(`backAll-${unique}`)
			.setDisabled(index == 0 ? true : false)
			.setEmoji('<:lastarrowleft:968284085363568721>')
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setEmoji('<:arrowleft:968284085472616469>')
			.setCustomId(`back-${unique}`)
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setLabel(`${index + 1}/${length}`)
			.setDisabled(true)
			.setCustomId('page')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setEmoji('<:arrowright:968284085342584912>')
			.setCustomId(`go-${unique}`)
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId(`goAll-${unique}`)
			.setDisabled(index == length - 1 ? true : false)
			.setEmoji('<:lastarrowright:968284085652963368>')
			.setStyle(ButtonStyle.Primary),
	)
} 

export const format_double_dec = (int: number) => {
	return int.toLocaleString("en", {minimumFractionDigits:2, maximumFractionDigits: 2})
}