import { ChannelType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import { v2 } from "osu-api-extended";
import { response } from "osu-api-extended/dist/types/v2_user_details";
import { response as OsuUser } from "osu-api-extended/dist/types/v2_user_details";
import { embed } from "../messages/embeds";
import { osu } from "./functions";
import { OsuCodeGamemodes } from "./types";
import OsuAccountTrackModel from "../../schemas/osutracking";
import GuildConfigModel from "../../schemas/guild";
import { client } from "../..";

const add = async (user: response, interaction: ChatInputCommandInteraction, gamemode?: number) => {
	const spanish = ["es-ES", "es-419"].includes(interaction.locale)
	const [already_in_sys, guild_config, user_double] = await Promise.all([
		await OsuAccountTrackModel.findOne({ uid: user.id, guild: interaction.guild?.id, mode: gamemode }),
		await GuildConfigModel.findOne({ id: interaction.guild?.id }),
		await OsuAccountTrackModel.findOne({ discord_id: interaction.user.id, guild: interaction.guild?.id })
	]);
	if (!gamemode) gamemode = 0
	const gamemode_code = osu.gamemode.code(gamemode)

	const log_channel = guild_config?.channel.logs ? client.channels.cache.get(`${guild_config?.channel.logs}`) : null;

	if (already_in_sys) {
		const full_mode = osu.gamemode.full(already_in_sys.mode_int)
		return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: 
				spanish ? ` **El usuario  :flag_${user.country_code.toLowerCase()}:  ${already_in_sys.username}**  ya está en el sistema para  **${full_mode}**.`
				: `The user  **:flag_${user.country_code.toLowerCase()}:  ${already_in_sys.username}**  is already being tracked in  **${full_mode}**.`,
				interaction: interaction
			})]
		})
	}
	if (user_double && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild, true) && user_double.id != user.id) {
		return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: 
				spanish ?
				`Ya tienes un perfil en el sistema:  **:flag_${user_double.country}:  ${user_double.username}**\n> Utiliza el comando \`/tracking osu eliminar\` primero.` :
				`You already have a profile in the system:  **:flag_${user_double.country}:  ${user_double.username}**\n> Use \`/tracking osu delete\` first.`,
				interaction: interaction
			})]
		})
	}

	const recent = await v2.scores.user.category(user.id, "recent", { include_fails: false, mode: gamemode_code, limit: "1" })
	await new OsuAccountTrackModel({
		username: user.username,
		uid: user.id,
		mode: gamemode_code,
		mode_int: gamemode,
		country: user.country.code.toLowerCase(),
		last_score_id: recent[0]?.id || 0,
		discord_id: interaction.user.id,
		guild: interaction.guild?.id,
	}).save()

	await interaction.editReply({
		embeds: [embed.response({
			type: "success",
			description: spanish ?
			`El usuario  **:flag_${user.country.code.toLowerCase()}:  ${user.username}**  fue añadido al sistema de score tracking de  **${osu.gamemode.full(gamemode_code)}**.`
			: `The user  **:flag_${user.country.code.toLowerCase()}:  ${user.username}**  has been added to the  **${osu.gamemode.full(gamemode_code)}**  score tracking system.`,
			interaction: interaction
		})]
	})

	if (log_channel && log_channel?.type == ChannelType.GuildText) {
		log_channel.send({
			embeds: [embed.logs({
				type: "success",
				title: `Se añadió un usuario al sistema de tracking de ${osu.gamemode.full(gamemode_code)}.`,
				description: `El usuario  **:flag_${user.country.code.toLowerCase()}:  ${user.username}**  fue añadido por <@${interaction.user.id}>`,
				interaction: interaction
			})]
		})
	}
}


const remove = async (user: OsuUser, interaction: ChatInputCommandInteraction, gamemode?: number) => {
	const spanish = ["es-ES", "es-419"].includes(interaction.locale)

	const [user_modes, guild_config] = await Promise.all([
		await OsuAccountTrackModel.findOne({ uid: user.id, guild: interaction.guild?.id }),
		await GuildConfigModel.findOne({ id: interaction.guild?.id }),
	])

	const log_channel = guild_config?.channel.logs ? client.channels.cache.get(`${guild_config?.channel.logs}`) : null;

	if (!user_modes) {
		return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: spanish ? 
				`Ese perfil no está en el sistema.` 
				: "That user isn't in the score tracking system.",
				interaction: interaction
			})]
		})
	} else if (user_modes.discord_id != interaction.user.id && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild, true)) {
		return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: spanish ?
				`No puedes eliminar a  **:flag_${user_modes.country.toLowerCase()}:  ${user_modes.username}**  del sistema, porque no está asociado a tu cuenta de Discord.`
				: `You can't delete  **:flag_${user_modes.country.toLowerCase()}:  ${user_modes.username}**  from the system, as it isn't linked to your Discord account.`,
				interaction: interaction
			})]
		})
	}
	let deleted = ""
	let log_deleted = ""
	if (gamemode) {
		await OsuAccountTrackModel.deleteOne({ uid: user.id, guild: interaction.guild?.id, mode_int: gamemode })
		deleted = ` ${osu.gamemode.full(gamemode)} `
		log_deleted = ""
	} else {
		await OsuAccountTrackModel.deleteMany({ uid: user.id, guild: interaction.guild?.id })
		deleted = spanish ? `todos los modos de juego de osu!` : "every osu! gamemode's"
		log_deleted = "todos los modos de juego de osu!"
	}
	await interaction.editReply({
		embeds: [embed.response({
			type: "success",
			description: spanish ?
			`El usuario  **:flag_${user.country.code.toLowerCase()}:  ${user.username}**  fue eliminado del sistema de score tracking de ${deleted}` :
			`The user  **:flag_${user.country.code.toLowerCase()}:  ${user.username}**  was deleted from the ${deleted} score tracking system.`,
			interaction: interaction
		})]
	})

	if (log_channel && log_channel?.type == ChannelType.GuildText) {
		log_channel.send({
			embeds: [embed.logs({
				type: "warn",
				title: `Se eliminó a un usuario del sistema de tracking de ${gamemode ? osu.gamemode.name(gamemode) : log_deleted }`,
				description: `El usuario  **:flag_${user.country.code.toLowerCase()}:  ${user.username}**  fue eliminado por <@${interaction.user.id}>`,
				interaction: interaction
			})]
		})
	}
}
export const tracking = { add, remove }