import type { ButtonInteraction, ChatInputCommandInteraction, Client, ClientEvents, Collection, SharedSlashCommand } from "discord.js"

export type GlobClient = Client<true> & ExtraClient

interface ExtraClient {
	events: Collection<keyof ClientEvents, () => void>
	commands: Collection<string, Command>
	cooldowns: Collection<string, number>
}

export interface Event<T extends keyof ClientEvents> {
	name: T
	rest?: boolean
	once?: boolean
	execute: (client: GlobClient, ...args: ClientEvents[T]) => void
}

export interface Command {
	cooldown?: number
	data: SharedSlashCommand
	disabled?: boolean
	developer?: boolean
	execute: (client: GlobClient, interaction: ChatInputCommandInteraction) => void
}

interface Component {
	name: string
}

export interface Button extends Component {
	execute: (client: GlobClient, interaction: ButtonInteraction, ...args: string[]) => void
}

export type Color = | 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Blue' | 'Purple' | 'White'

export interface LogCreatorParameters {
	prefix: string;
	message: string;
	color: Color;
	important?: boolean;
}