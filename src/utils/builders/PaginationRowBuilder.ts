import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ComponentType, InteractionCollector, Message, PermissionFlagsBits } from "discord.js";
export type RowActions = "first" | "back" | "next" | "last";

export class PaginationRowBuilder extends ActionRowBuilder<ButtonBuilder> {
	public index: number;
	public length: number;
	public ID: string;
	private message: Message;
	public collector: InteractionCollector<ButtonInteraction<CacheType>>;
	private collector_timeout: NodeJS.Timeout | null;

	constructor(message: Message) {
		super()
		this.ID = Math.floor(Math.random() * 10000000).toString();
		this.index = 0;
		this.length = 0;
		this.message = message;
		this.collector = message.createMessageComponentCollector({ componentType: ComponentType.Button });
		this.setComponents(
			new ButtonBuilder()
				.setCustomId(`first-${this.ID}`)
				.setDisabled(this.index == 0 ? true : false)
				.setEmoji('<:lastarrowleft:968284085363568721>')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder()
				.setEmoji('<:arrowleft:968284085472616469>')
				.setCustomId(`back-${this.ID}`)
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setLabel(`${this.index + 1}/${this.length}`)
				.setDisabled(true)
				.setCustomId('page')
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setEmoji('<:arrowright:968284085342584912>')
				.setCustomId(`next-${this.ID}`)
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId(`last-${this.ID}`)
				.setDisabled(this.index == this.length - 1 ? true : false)
				.setEmoji('<:lastarrowright:968284085652963368>')
				.setStyle(ButtonStyle.Primary),
		)
		this.collector_timeout = null;
	}

	public setIndex(index: number) {
		this.index = index;
		this.updateButtons();
		return this;
	}

	public setLength(length: number) {
		this.length = length;
		this.updateButtons();
		return this;
	}

	public handleAction(action: RowActions) {
		const actions: Record<string, () => void> = {
			first: () => { this.index = 0 },
			back: () => { this.index-- },
			next: () => { this.index++ },
			last: () => { this.index = this.length - 1 },
		};
		actions[action]();
		if (this.index < 0) this.index = this.length - 1;
		if (this.index > this.length - 1) this.index = 0;
		this.updateButtons();
		this.restartTimeout();
		return this;
	}

	public startTimeout(seconds: number = 120) {
		this.collector_timeout = setTimeout(() => {
			this.collector.stop()
			for (const button of this.components) {
				button.setDisabled(true);
			}
			this.message.edit({ components: [this] })
			setTimeout(() => { this.message.edit({ components: [] }) }, 5000)
		}, 1000 * seconds)
		return this;
	}

	public restartTimeout() {
		if (this.collector_timeout) clearTimeout(this.collector_timeout);
		this.startTimeout();
		return this;
	}

	private updateButtons() {
		this.components[0].setDisabled(this.index == 0 ? true : false)
		this.components[2].setLabel(`${this.index + 1}/${this.length}`)
		this.components[4].setDisabled(this.index == this.length - 1 ? true : false)
		return this;
	}
}