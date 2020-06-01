
/** Page info object, includes chapter and page */
interface PageInfo {
	/** Relevant chapter to page, 0-indexed */
	chapter: number;
}

/** This is what getPageSrc will return */
export interface Page {
	/** Sources of images in chapter */
	sources: string[];
	/** Array of numbers mapping the chapters */
	chapters?: number[];
	/** Array of numbers mapping the pages */
	pages?: number[];
	/** Current page */
	current: PageInfo;
}

/**
 * Returns an array of option values
 * @param pageHTML page's HTML, including the <option> tags
 * @param className classname of the relevant <select>, e.g "input-xs PageSelect"
 */
function getOptionValues(pageHTML: string, className: string): number[] {
	let optionStr = pageHTML.split(`<select class="${className}">`)[1].split("</select>")[0];
	// Get matches for option elements
	let optionMatches = (optionStr.match(/option value=("|')\d+("|')( selected)?>.{0,20} (\d+)<\/option>/g) ?? []);
	// Map option elements to their values
	let values: number[] = optionMatches.map((p: string) => {
		let m = p.match(/\d+/g);
		// 1 or 0 because chapters only show the proper values in text
		if(m) return Number(m[1] ?? m[0]);
		return 0;
	});
	return values;
}

/**
 * Get a URL to an image
 * @param rootUrl Root URL for manga with %slug%. e.g "https://mangaseeonline.us/read-online/%slug%.html"
 * @param slug Slug for page, including %chapter%, e.g: Fire-Brigade-Of-Flames-chapter-%chapter%
 * @param chapter Chapter number, 0-indexed
 * @param page Chapter page, 1-indexed
 */
async function getPageSrc(rootUrl: string, slug: string, chapter: number): Promise<Page> {
	// Generate URL
	let url = rootUrl.replace(/%slug%/g, slug)
	  .replace(/%chapter%/g, chapter.toString())

	// Get HTML from page
	let pageHTML = await (await fetch(url)).text();

	// Extract source from page
	let sources = (pageHTML.match(/<div class=("|')fullchapimage("|')><img src="[a-z|A-Z|:|\/|\d|\.|-]+"><\/div>/g) ?? []).map(match => {
		let url = match.match(/<img src="([a-z|A-Z|:|\/|\d|\.|-]+)">/);
		return url ? url[1]: "";
	}).filter(Boolean);

	// Get chapters in array format
	let chapters = getOptionValues(pageHTML, "input-xs ChapterSelect");

	// Current page and chapter
	let current = { chapter };

	// Return value
	let returning: Page = { current, sources, chapters }

	return returning;
}

export default getPageSrc;