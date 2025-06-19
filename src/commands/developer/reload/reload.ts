import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";
import { REST, SlashCommandBuilder } from "discord.js";
import { exec } from "child_process";
import { promisify } from "util";

export const developer: SlashCommand["developer"] = true;
export const disabled: SlashCommand["disabled"] = true;

export const run: SlashCommand["run"] = async (client, interaction) => {
	await interaction.deferReply();
	const command = interaction.options.getString("command", true);
	const slashCommand = client.commands.get(command);
	if (!slashCommand) return interaction.editReply({ embeds: [Embeds.error({ description: "That command doesn't exist.", user: interaction.user })] });
	const command_path = slashCommand.dirname.replace("dist", "src") + slashCommand.data.name + ".ts";
	// promisify(exec)(`tsc ${command_path}`).then(async () => {
	// 	client.commands.delete(command);
	// 	await client.application?.commands.delete(command);
	// 	delete require.cache[require.resolve(command_path)];
	// 	const new_command = await import(slashCommand.dirname + slashCommand.data.name + ".js") as SlashCommand;
	// 	client.commands.set(new_command.data.name, new_command);
	// 	const rest = new REST().setToken(process.env.TOKEN!);

	// 	await rest.put()
	// 	interaction.editReply({ embeds: [Embeds.response({ description: `\`${new_command.data.name}\` was reloaded.`, user: interaction.user, color: "Green" })] });
	// });
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("reload")
		.setDescription("🛠️ (DEV!) Reload and deploy a command.")
		.setDescriptionLocalization("es-ES", "🛠️ (DEV!) Recargar y desplegar un comando.")
		.addStringOption(option =>
			option.setName("command")
				.setDescription("The command to reload.")
				.setDescriptionLocalization("es-ES", "El comando a recargar.")
				.setRequired(true))

export const dirname = __dirname;