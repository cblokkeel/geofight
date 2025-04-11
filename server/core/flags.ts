// Temporary while coding the app

interface Flag {
	code: string;
	name: string;
	imageUrl: string;
}

const flags: Flag[] = [
	{
		code: "us",
		name: "United States",
		imageUrl: "https://flagcdn.com/w320/us.png",
	},
	{
		code: "gb",
		name: "United Kingdom",
		imageUrl: "https://flagcdn.com/w320/gb.png",
	},
	{
		code: "fr",
		name: "France",
		imageUrl: "https://flagcdn.com/w320/fr.png",
	},
	{
		code: "de",
		name: "Germany",
		imageUrl: "https://flagcdn.com/w320/de.png",
	},
	{
		code: "jp",
		name: "Japan",
		imageUrl: "https://flagcdn.com/w320/jp.png",
	},
	{
		code: "cn",
		name: "China",
		imageUrl: "https://flagcdn.com/w320/cn.png",
	},
	{
		code: "br",
		name: "Brazil",
		imageUrl: "https://flagcdn.com/w320/br.png",
	},
	{
		code: "au",
		name: "Australia",
		imageUrl: "https://flagcdn.com/w320/au.png",
	},
	{
		code: "ca",
		name: "Canada",
		imageUrl: "https://flagcdn.com/w320/ca.png",
	},
	{
		code: "in",
		name: "India",
		imageUrl: "https://flagcdn.com/w320/in.png",
	},
	{
		code: "it",
		name: "Italy",
		imageUrl: "https://flagcdn.com/w320/it.png",
	},
	{
		code: "mx",
		name: "Mexico",
		imageUrl: "https://flagcdn.com/w320/mx.png",
	},
	{
		code: "ru",
		name: "Russia",
		imageUrl: "https://flagcdn.com/w320/ru.png",
	},
	{
		code: "za",
		name: "South Africa",
		imageUrl: "https://flagcdn.com/w320/za.png",
	},
	{
		code: "kr",
		name: "South Korea",
		imageUrl: "https://flagcdn.com/w320/kr.png",
	},
];

export function getRandomFlag(): Flag {
	return flags[Math.floor(Math.random() * flags.length)];
}

export function getAllFlags(): Flag[] {
	return [...flags];
}
