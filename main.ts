import mangasee, { Page } from "./mangasee.ts";

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

let chapterImages = await getChapter(rootUrl, slug, chapter);
console.log(chapterImages);