import mangasee, { Page } from "./mangasee.ts";
import bot from "./bot.ts";

let rootUrl = "https://mangaseeonline.us/read-online/%slug%.html";
let slug = "Fire-Brigade-Of-Flames-chapter-%chapter%-page-%page%";
let chapter = 2;
let page = 16;
async function getChapter(rootUrl: string, slug: string, chapter: number): Promise<string[]> {
	let page = 1;
	let tmpValue = await mangasee(rootUrl, slug, chapter, page);
	
	if(tmpValue.pages) {
		let imagePromises = tmpValue.pages?.map(async pageNumber => {
			let info = await mangasee(rootUrl, slug, chapter, pageNumber);
			return info;
		});
		let infoObjects: Page[] = await Promise.all(imagePromises);
		let images = infoObjects.map(obj => obj?.src ?? "").filter(Boolean);
		return images;
	}
	return [];
}

// Bot stuff!
bot.evt.messageCreate.attach(async ({ message} ) => {
	console.log(`${message.author.username}: ${message.content}`);
	if(message.author.bot) return;
	let chapterMatch = message.content.match(/;chapter (\d+)/i);
	if(chapterMatch) {
	
		bot.postTypingIndicator(message.channel.id);

		// Remove one because chapters are 0-indexed
		let chapterImages = await getChapter(rootUrl, slug, Number(chapterMatch[1]));
		let msgStrs = chapterImages.map((url, i) => `${i + 1}: ${url}`);
		
		// Generate array with multiple URLs
		// Discord won't allow all of them in one msg,
		// so we'll do this instead
		let newArr = [];
		while(msgStrs.length > 0) {
			newArr.push(msgStrs.splice(0, 5));
		}

		let initialMessage = outlineMsg(`There you go <@${message.author.id}>, chapter ${Number(chapterMatch[1])}`);
		await bot.postMessage(message.channel.id, initialMessage)
		
		for(let strArr of newArr) {
			let str = strArr.join("\n")
			await bot.postMessage(message.channel.id, str);
		}

		let endMessage = outlineMsg(`There you go <@${message.author.id}>, that was chapter ${Number(chapterMatch[1])}`)
		await bot.postMessage(message.channel.id, endMessage);
	}
});

function outlineMsg(str: string) {
	return `
	${"—".repeat(20)}

	${str}

	${"—".repeat(20)}`.replace(/\t/g, "");
}

bot.connect();