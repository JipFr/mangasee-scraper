
let rootUrl = "https://mangaseeonline.us/read-online/%slug%.html";
let slug = "Fire-Brigade-Of-Flames-chapter-%chapter%-page-%page%";
let chapter = 2;
let page = 16;

/** Page info object, includes chapter and page */
interface PageInfo {
	/** Relevant chapter to page, 0-indexed */
	chapter: number;
	/** Page number, 1-indexed */
	page: number;
}

/** This is what getPageSrc will return */
interface Page {
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
}

function getOptionValues(pageHTML: string, className: string): number[] {
	let optionStr = pageHTML.split(`<select class="${className}">`)[1].split("</select>")[0];
	let arr = (optionStr.match(/option value=("|')\d+("|')>.{0,20} (\d+)<\/option>/g) ?? []);
	let values: number[] = arr.map((p: string) => {
		let m = p.match(/\d+/g);
		if(m) return Number(m[1] ?? m[0]);
		return 0;
	});
	return values;
}

/**
 * Get a URL to an image
 * @param slug Slug for page, including %chapter% and %page%, e.g: Fire-Brigade-Of-Flames-chapter-%chapter%-page-%page%
 * @param chapter Chapter number, 0-indexed
 * @param page Chapter page, 1-indexed
 */
async function getPageSrc(slug: string, chapter: number, page: number): Promise<Page> {
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

	// Return value
	let returning: Page = { next, previous }
	if(src) returning.src = src[1];
	if(pages) returning.pages = pages;
	if(chapters) returning.chapters = chapters;

	return returning;
}

let x = await getPageSrc(slug, chapter, page);
console.log(x);