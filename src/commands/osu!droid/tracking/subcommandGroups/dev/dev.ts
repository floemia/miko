import { SlashCommand } from "@structures/core";
import { tracking_start, tracking_stop, tracking_update } from "./subcommands/";
import { Config } from "@core/Config";
import { InteractionHelper } from "@utils/helpers";

export const tracking_dev: SlashCommand["run"] = async (client, interaction) => {
    const t = InteractionHelper.getLocale(interaction);
    if (!Config.developers.includes(interaction.user.id)) return await InteractionHelper.replyError(interaction, t.general.no_dev);
    switch (interaction.options.getSubcommand()) {
        case "start":
            await tracking_start(client, interaction);
            break;
        case "stop":
            await tracking_stop(client, interaction);
            break;
        case "update":
            await tracking_update(client, interaction);
            break;
    }
}