import mangasee from "./mangasee.ts";

let rootUrl = "https://mangaseeonline.us/read-online/%slug%.html";
let slug = "Fire-Brigade-Of-Flames-chapter-%chapter%-page-%page%";
let chapter = 2;
let page = 16;

let x = await mangasee(rootUrl, slug, chapter, page);
console.log(x);