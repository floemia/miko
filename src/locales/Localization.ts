import { DroidUser } from "@floemia/osu-droid-utils";

export interface Localization {
	general: {
		disabled: string;
		error: string;
		cooldown: (time: number) => string;
		user_dne: string;
		no_scores: (user: DroidUser) => string;
		dev_only: string;
		scraping: string;
		you_no_link: string;
		mention_no_link: string;
		api_broken: string;
	};
	commands: {
		ping: {
			response: (ping: number) => string;
		};
		recent: {
			generating: (user: DroidUser) => string;
			message: (user: DroidUser, index: number) => string;
		};
		link: {
			success: (user: DroidUser) => string;
		};
		top: {
			generating: (user: DroidUser) => string;
			title: string;
		};
		uptime: {
			response: (uptime: number) => string;
		};
		config: {
			track_channel: {
				set: (channel: string, permission: boolean) => string;
			};
			track: {
				enabled: (status: boolean) => string;
			};
			prefix: {
				set: (prefix: string) => string;
			};
		};
		defaultserver: {
			response: (server: string) => string;
		};
		card: {
			generating: (user: DroidUser) => string;
		};
		recent50: {
			generating: (user: DroidUser) => string;
			title: string;
		}
	};
	tracking: {
		message: (user: DroidUser) => string;
	};
}