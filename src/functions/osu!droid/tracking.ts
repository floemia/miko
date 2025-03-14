import { ChannelType, ChatInputCommandInteraction, Guild, PermissionsBitField } from "discord.js";
import { client } from "../..";
import DroidAccountTrackModel from "../../schemas/droidtracking";
import GuildConfigModel from "../../schemas/guild";
import { embed } from "../messages/embeds";
import { NewDroidUser, DroidScoreExtended } from "miko-modules";

const add = async (user: NewDroidUser, last_score: DroidScoreExtended | undefined, interaction: ChatInputCommandInteraction) => {
	const spanish = ["es-ES", "es-419"].includes(interaction.locale)
	const guild_id = interaction.guild?.id;
	const user_id = interaction.user.id;
	const [already_in_sys, guild_config, user_double] = await Promise.all([
		DroidAccountTrackModel.findOne({ uid: user.id, guild: guild_id }),
		GuildConfigModel.findOne({ id: guild_id }),
		DroidAccountTrackModel.findOne({ discord_id: user_id, guild: guild_id })
	]);

	const log_channel = guild_config?.channel.logs ? client.channels.cache.get(`${guild_config?.channel.logs}`) : null;

	if (already_in_sys) {
		return interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: spanish ?
				`El usuario  **:flag_${already_in_sys.country.toLowerCase()}:  ${already_in_sys.username}**  ya está en el sistema.`
				: `The user  **:flag_${already_in_sys.country.toLowerCase()}:  ${already_in_sys.username}**  is already being tracked.`,
				interaction: interaction
			})]
		});
	}

	if (user_double && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild)) {
		return interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: spanish ?
				`Ya tienes un perfil en el sistema:  **:flag_${user_double.country.toLowerCase()}:  ${user_double.username}**\n> Utiliza el comando \`/tracking droid eliminar\` primero.` :
				`You already have a profile in the system:  **:flag_${user_double.country.toLowerCase()}:  ${user_double.username}**\n> Use \`/tracking droid delete\` first.`,				
				interaction: interaction
			})]
		});
	}

	await new DroidAccountTrackModel({
		username: user.username,
		uid: user.id,
		timestamp: last_score ? last_score.played_date.getMilliseconds() :  0,
		country: user.region,
		last_score: last_score ? last_score.score :  0,
		discord_id: user_id,
		guild: guild_id
	}).save();

	await interaction.editReply({
		embeds: [embed.response({
			type: "success",
			description: spanish ?
			`El usuario  **:flag_${user.region.toLowerCase()}: ${user.username}** fue añadido al sistema de tracking de  <:droid_simple:1021473577951821824>  **osu!droid**.`
			: `The user  **:flag_${user.region.toLowerCase()}: ${user.username}** was successfully added to the  <:droid_simple:1021473577951821824>  **osu!droid**  score tracking system.`,
			interaction: interaction
		})]
	});

	if (log_channel?.type === ChannelType.GuildText) {
		log_channel.send({
			embeds: [embed.logs({
				type: "success",
				title: "Se añadió un usuario al sistema de tracking de osu!droid.",
				description: `El usuario **:flag_${user.region.toLowerCase()}: ${user.username}** fue añadido por <@${user_id}>`,
				interaction
			})]
		});
	}
};

const remove = async (user: NewDroidUser, interaction: ChatInputCommandInteraction) => {
	const spanish = ["es-ES", "es-419"].includes(interaction.locale)
	const guild_id = interaction.guild?.id;
	const [found_in_sys, guild_config] = await Promise.all([
		DroidAccountTrackModel.findOne({ uid: user.id, guild: guild_id }),
		GuildConfigModel.findOne({ id: guild_id }),
	]);

	const log_channel = guild_config?.channel.logs ? client.channels.cache.get(`${guild_config?.channel.logs}`) : null;

	if (!found_in_sys) {
		return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: spanish ?
				`El usuario  **:flag_${user.region.toLowerCase()}:  ${user.username}**  no está en el sistema de score tracking.`
				: `The user  **:flag_${user.region.toLowerCase()}:  ${user.username}**  isn't in the score tracking system.`,
				interaction: interaction
			})]
		})
	} else if (found_in_sys.discord_id != interaction.user.id && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild, true)) {
		return await interaction.editReply({
			embeds: [embed.response({
				type: "error",
				description: spanish ?
				`No puedes eliminar a  **:flag_${user.region.toLowerCase()}:  ${user.username}**  del sistema, porque no está asociado a tu cuenta de Discord.`
				: `You can't delete  **:flag_${user.region.toLowerCase()}:  ${user.username}**  from the score tracking system, as the user isn't linked to your Discord account.`,
				interaction: interaction
			})]
		})
	}
	await found_in_sys.deleteOne().then(async () => {
		await interaction.editReply({
			embeds: [embed.response({
				type: "success",
				description: spanish ?
				`El usuario  **:flag_${user.region.toLowerCase()}:  ${user.username}**  fue eliminado del sistema de tracking de  <:droid_simple:1021473577951821824>  **osu!droid**.`
				:`The user  **:flag_${user.region.toLowerCase()}:  ${user.username}** was deleted from the  <:droid_simple:1021473577951821824>  **osu!droid**  score tracking system.` ,
				interaction: interaction
			})]
		})

		if (log_channel && log_channel?.type == ChannelType.GuildText) {
			log_channel.send({
				embeds: [embed.logs({
					type: "warn",
					title: "Se eliminó a un usuario del sistema de tracking de osu!droid.",
					description: `El usuario  **:flag_${user.region.toLowerCase()}:  ${user.username}**  fue eliminado por <@${interaction.user.id}>`,
					interaction: interaction
				})]
			})
		}
	})
}
export const tracking = { add, remove }