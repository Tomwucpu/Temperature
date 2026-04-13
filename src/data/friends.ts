export type FriendLink = {
	name: string;
	url: string;
	description: string;
	avatar?: string;
	tags?: string[];
};

export const friends: FriendLink[] = [
	{
		name: "Tomwucpu",
		url: "https://blog.temperaturetw.top/",
		description: "相信明天会更美好",
		avatar: "https://blog.temperaturetw.top/_astro/avatar.3QuDDNlT_wsodL.webp",
		tags: ["博客", "全栈"],
	},
];
