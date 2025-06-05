import { Color } from "@utils/Misc";
export type LogCreatorParameters = {
	prefix: string;
	message: string;
	color?: Color;
	important?: boolean;
}