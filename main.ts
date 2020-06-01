import mangasee from "./mangasee.ts";

let rootUrl = "https://mangaseeonline.us/read-online/%slug%.html";
let slug = "Fire-Brigade-Of-Flames-chapter-%chapter%";
let chapter = 2;

// Example
let stuff = await mangasee(rootUrl, slug, chapter);
console.log(stuff);