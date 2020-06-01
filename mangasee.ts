
/** Page info object, includes chapter and page */
interface PageInfo {
	/** Relevant chapter to page, 0-indexed */
	chapter: number;
	/** Page number, 1-indexed */
	page: number;
}

/** This is what getPageSrc will return */
export interface Page {
	/** Source of image to page in chapter */
	src?: string;
	/** Array of numbers mapping the chapters */
	chapters?: number[];
	/** Array of numbers mapping the pages */
	pages?: number[];
	/** Next page */
	next: PageInfo | null;
	/** Previous page */
	previous: PageInfo | null;
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
 * @param slug Slug for page, including %chapter% and %page%, e.g: Fire-Brigade-Of-Flames-chapter-%chapter%-page-%page%
 * @param chapter Chapter number, 0-indexed
 * @param page Chapter page, 1-indexed
 */
async function getPageSrc(rootUrl: string, slug: string, chapter: number, page: number): Promise<Page> {
	// Generate URL
	let url = rootUrl.replace(/%slug%/g, slug)
	  .replace(/%chapter%/g, chapter.toString())
	  .replace(/%page%/g, page.toString());

	// Get HTML from page
	let pageHTML = await (await fetch(url)).text();

	// Extract source from page
	let src = pageHTML.match(/img class="CurImage nextBtn" src="(.+)"/);
	
	// Get pages in array format
	let pages = getOptionValues(pageHTML, "input-xs PageSelect");

	// Get chapters in array format
	let chapters = getOptionValues(pageHTML, "input-xs ChapterSelect");

	// Get next page
	let next: PageInfo | null = null;
	if(pages.includes(page + 1)) {
		// Next page is in same chapter
		next = {
			chapter,
			page: page + 1
		}
	} else if(chapters.includes(chapter + 1)) {
		// Next page is in next chapter
		next = {
			chapter: chapter + 1,
			page: 1
		}
	}

	// Get previous page
	let previous: PageInfo | null = null;
	if(pages.includes(page - 1)) {
		// Previous page is in same chapter
		previous = {
			chapter,
			page: page - 1
		}
	} else if(chapters.includes(chapter + 1)) {
		// Previous page is in the previous chapter
		previous = {
			chapter: chapter - 1,
			page: -1 // ¯\_(ツ)_/¯
		}
	}

	// Current page and chapter
	let current = { chapter, page };

	// Return value
	let returning: Page = { next, previous, current }
	if(src) returning.src = src[1];
	if(pages) returning.pages = pages;
	if(chapters) returning.chapters = chapters;

	return returning;
}

export default getPageSrc;