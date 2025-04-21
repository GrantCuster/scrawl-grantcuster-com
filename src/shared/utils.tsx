import slugify from "slugify";
import { PostType } from "./types";

export function makeSlug(text: string) {
  return slugify(text, {
    lower: true, // Convert to lowercase
    strict: true, // Remove special characters
    replacement: "-", // Replace spaces with hyphens (default)
  });
}

export function makeSocialShare(post: PostType) {
  let status = "✏️ ";
  status += post.text.split("\n")[0];
  let truncated = status.slice(0, 300);
  return truncated;
}

export function getWordCount(text: string) {
  return text.trim().split(/\s+/).length;
}

export function printWordCount(text: string)  {
  return getWordCount(text) + (text.length === 1 ? " word" : " words");
}
