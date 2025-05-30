import { ChannelType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import { client } from "../..";
import DroidAccountTrackModel from "../../schemas/DroidAccountTrackSchema";
import GuildConfigModel from "../../schemas/GuildConfigSchema";
import { embed } from "../messages/embeds";
import { DroidBanchoScore, DroidUser, DroidScore } from "miko-modules";
import en from "../../locales/en"
import es from "../../locales/es"
import { utils } from "../../utils";
const languages = { en, es };

const add = async (user: DroidUser, last_score: DroidScore, interaction: ChatInputCommandInteraction) => {
	const spanish = ["es-ES", "es-419"].includes(interaction.locale)
	let response = spanish ? languages.es : languages.en
	const guild_id = interaction.guild!.id;
	const user_id = interaction.user.id;
	const [already_in_sys, guild_config, user_double] = await Promise.all([
		DroidAccountTrackModel.findOne({ uid: user.id }),
		GuildConfigModel.findOne({ id: guild_id }),
		DroidAccountTrackModel.findOne({ guilds: { "$elemMatch": { id: guild_id, owner_id: user_id } } })
	]);
	const log_channel = guild_config?.channel.logs ? client.channels.cache.get(`${guild_config?.channel.logs}`) : null;

	if (already_in_sys) {
		let guilds = already_in_sys.guilds.map(guild => guild.id)
		if (guilds.includes(guild_id)) {
			return interaction.editReply({
				embeds: [utils.embeds.error({ description: response.command.tracking.already_in(user), interaction: interaction, spanish: spanish }).setThumbnail(user.avatar_url)]
			});
		}
	}
	if (user_double && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild)) {
		return interaction.editReply({
			embeds: [utils.embeds.error({ description: response.command.tracking.double_user(user), interaction: interaction, spanish: spanish }).setThumbnail(user.avatar_url)]
		});
	}

	let db = await DroidAccountTrackModel.findOne({ uid: user.id })
	if (db) {
		await DroidAccountTrackModel.findOneAndUpdate({ uid: user.id }, { "$push": { guilds: { id: guild_id, owner_id: user_id } } })
	} else {
		new DroidAccountTrackModel({
			username: user.username,
			uid: user.id,
			timestamp: last_score ? last_score.played_date : 0,
			guilds: [{
				id: guild_id,
				owner_id: user_id
			}]
		}).save();
	}
	await interaction.editReply({
		embeds: [utils.embeds.success({ description: response.command.tracking.success(user), interaction: interaction, spanish: spanish }).setThumbnail(user.avatar_url)]
	});


	if (log_channel?.type === ChannelType.GuildText) {
		log_channel.send({
			embeds: [embed.logs({
				type: "success",
				title: "Se añadió un usuario al sistema de tracking de osu!droid.",
				description: `El usuario **${user.toString()}** fue añadido por <@${user_id}>`,
				interaction
			})]
		});
	}
};

const remove = async (user: DroidUser, interaction: ChatInputCommandInteraction) => {
	const spanish = ["es-ES", "es-419"].includes(interaction.locale)
	let response = spanish ? languages.es : languages.en
	const guild_id = interaction.guild!.id;
	const [found_in_sys, guild_config] = await Promise.all([
		DroidAccountTrackModel.findOne({ uid: user.id }),
		GuildConfigModel.findOne({ id: guild_id }),
	]);

	const log_channel = guild_config?.channel.logs ? client.channels.cache.get(`${guild_config?.channel.logs}`) : null;

	if (!found_in_sys || !found_in_sys.guilds.map(guild => guild.id).includes(guild_id)) {
		return await interaction.editReply({
			embeds: [utils.embeds.error({ description: response.command.tracking.not_found(user), interaction: interaction, spanish: spanish }).setThumbnail(user.avatar_url)]
		})
	} else if (!found_in_sys.guilds.includes({ id: guild_id, owner_id: interaction.user.id }) && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild, true)) {
		return await interaction.editReply({
			embeds: [utils.embeds.error({ description: response.command.tracking.not_yours(user), interaction: interaction, spanish: spanish }).setThumbnail(user.avatar_url)]
		})
	}
	if (found_in_sys.guilds.length == 1) await found_in_sys.deleteOne()
	else {
		await found_in_sys.updateOne({ "$pull": { guilds: { id: guild_id, owner_id: interaction.user.id } } })
	}
	await interaction.editReply({
		embeds: [utils.embeds.success({ description: response.command.tracking.deleted(user), interaction: interaction, spanish: spanish }).setThumbnail(user.avatar_url)]
	})

	if (log_channel && log_channel?.type == ChannelType.GuildText) {
		log_channel.send({
			embeds: [embed.logs({
				type: "warn",
				title: "Se eliminó a un usuario del sistema de tracking de osu!droid.",
				description: `El usuario  **${user.toString()}**  fue eliminado por <@${interaction.user.id}>`,
				interaction: interaction
			})]
		})
	}
}

export const tracking = { add, remove }