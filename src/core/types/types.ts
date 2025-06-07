export interface ConfigFile {
	debug: boolean;
	scraping: boolean;
	developers: string[];
	tracking: {
		droid: {
			enabled: boolean;
		};
		interval: number;
	};
	servers: {
		ibancho: {
			name: string;
			iconURL: string;
		};
		rx: {
			name: string;
			iconURL: string;
		};
	};
	emojis: {
		ranks: {
			A: string;
			B: string;
			C: string;
			D: string;
			S: string;
			SH: string;
			X: string;
			XH: string;
		};
		status: {
			4: string;
			3: string;
			2: string;
			1: string;
		};
	};
}