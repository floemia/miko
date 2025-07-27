export interface TrackingOptions {
	enabled: boolean;
	interval: number;
}

export interface DroidServerData {
	name: string;
	iconURL: string;
}

export interface DroidServer {
	ibancho: DroidServerData;
	rx: DroidServerData;
}

export interface RankEmojis {
	A: string;
	B: string;
	C: string;
	D: string;
	S: string;
	SH: string;
	X: string;
	XH: string;
}

export interface StatusEmojis {
	4: string;
	3: string;
	2: string;
	1: string;
}

export interface Emojis {
	ranks: RankEmojis;
	status: StatusEmojis;
}

export interface ClientConfig {
	debug: boolean;
	scraping: boolean;
	developers: string[];
	test_guild: string;
	tracking: TrackingOptions;
	servers: DroidServer;
	emojis: Emojis;
}