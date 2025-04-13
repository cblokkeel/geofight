import { Flag as FlagModel } from "../models/flags";

interface Flag {
	name: string;
	imageUrl: string;
}

export async function getRandomFlag(): Promise<Flag> {
	const flags = await FlagModel.find();

	if (flags.length === 0) {
		throw new Error("No flags found");
	}

	const { name, img_url: imageUrl } =
		flags[Math.floor(Math.random() * flags.length)];

	return { name, imageUrl };
}
