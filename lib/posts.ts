import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");
const notesDirectory = path.join(process.cwd(), "content/notes");

export interface Author {
	name: string;
	url?: string;
	main?: boolean;
}

export interface Post {
	slug: string;
	title: string;
	date: string;
	description?: string;
	mainTags?: string[];
	tags?: string[];
	thumbnail?: string;
	authors?: Author[];
	bibtex?: string;
	content: string;
}

function ensureDirectoryExists(dir: string) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

export function stripMdxImports(content: string): string {
	return content
		.split('\n')
		.filter(line => !line.trim().startsWith('import '))
		.join('\n');
}

function toCamelCase(str: string): string {
	return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function convertStyleStringToJsx(styleString: string): string {
	const properties: string[] = [];
	styleString.split(";").forEach((rule) => {
		const colonIndex = rule.indexOf(":");
		if (colonIndex === -1) return;
		const property = rule.slice(0, colonIndex).trim();
		const value = rule.slice(colonIndex + 1).trim();
		if (property && value) {
			const camelProp = toCamelCase(property);
			properties.push(`${camelProp}: "${value}"`);
		}
	});
	return `{{ ${properties.join(", ")} }}`;
}

export function transformHtmlStyleToJsx(content: string): string {
	return content.replace(
		/style="([^"]*)"/g,
		(_, styleValue) => `style=${convertStyleStringToJsx(styleValue)}`
	);
}

export function getAllPosts(): Post[] {
	ensureDirectoryExists(postsDirectory);

	const fileNames = fs.readdirSync(postsDirectory);
	const posts = fileNames
		.filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
		.map((fileName) => {
			const slug = fileName.replace(/\.mdx?$/, "");
			const fullPath = path.join(postsDirectory, fileName);
			const fileContents = fs.readFileSync(fullPath, "utf8");
			const { data, content } = matter(fileContents);

			const dateStr = data.publishDate || data.date;

			return {
				slug,
				title: data.title || slug,
				date: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
				description: data.description || "",
				mainTags: data.mainTags || [],
				tags: data.tags || [],
				thumbnail: data.thumbnail,
				authors: data.authors,
				bibtex: data.bibtex,
				content,
			};
		});

	return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): Post | null {
	ensureDirectoryExists(postsDirectory);

	const mdPath = path.join(postsDirectory, `${slug}.md`);
	const mdxPath = path.join(postsDirectory, `${slug}.mdx`);

	let fullPath: string;
	if (fs.existsSync(mdxPath)) {
		fullPath = mdxPath;
	} else if (fs.existsSync(mdPath)) {
		fullPath = mdPath;
	} else {
		return null;
	}

	const fileContents = fs.readFileSync(fullPath, "utf8");
	const { data, content } = matter(fileContents);

	const dateStr = data.publishDate || data.date;

	return {
		slug,
		title: data.title || slug,
		date: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
		description: data.description || "",
		mainTags: data.mainTags || [],
		tags: data.tags || [],
		thumbnail: data.thumbnail,
		authors: data.authors,
		bibtex: data.bibtex,
		content: transformHtmlStyleToJsx(stripMdxImports(content)),
	};
}

export function getNoteBySlug(slug: string): Post | null {
	ensureDirectoryExists(notesDirectory);

	const mdPath = path.join(notesDirectory, `${slug}.md`);
	const mdxPath = path.join(notesDirectory, `${slug}.mdx`);

	let fullPath: string;
	if (fs.existsSync(mdxPath)) {
		fullPath = mdxPath;
	} else if (fs.existsSync(mdPath)) {
		fullPath = mdPath;
	} else {
		return null;
	}

	const fileContents = fs.readFileSync(fullPath, "utf8");
	const { data, content } = matter(fileContents);

	const dateStr = data.publishDate || data.date;

	return {
		slug,
		title: data.title || slug,
		date: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
		description: data.description || "",
		tags: data.tags || [],
		content: transformHtmlStyleToJsx(stripMdxImports(content)),
	};
}

export function getAllNotes(): Post[] {
	ensureDirectoryExists(notesDirectory);

	const fileNames = fs.readdirSync(notesDirectory);
	const notes = fileNames
		.filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
		.map((fileName) => {
			const slug = fileName.replace(/\.mdx?$/, "");
			const fullPath = path.join(notesDirectory, fileName);
			const fileContents = fs.readFileSync(fullPath, "utf8");
			const { data, content } = matter(fileContents);

			const dateStr = data.publishDate || data.date;

			return {
				slug,
				title: data.title || slug,
				date: dateStr ? new Date(dateStr).toISOString() : new Date().toISOString(),
				description: data.description || "",
				tags: data.tags || [],
				content,
			};
		});

	return notes.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getAllTags(): string[] {
	const posts = getAllPosts();
	const notes = getAllNotes();
	const allContent = [...posts, ...notes];

	const tagsSet = new Set<string>();
	allContent.forEach((item) => {
		item.tags?.forEach((tag) => tagsSet.add(tag));
	});

	return Array.from(tagsSet).sort();
}
