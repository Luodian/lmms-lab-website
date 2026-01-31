// Game entity types for Stardew Valley style pixel world

export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

export type Direction = "up" | "down" | "left" | "right";

export interface Sprite {
	image: HTMLImageElement | null;
	frameWidth: number;
	frameHeight: number;
	currentFrame: number;
	frameCount: number;
	animationSpeed: number; // frames per second
}

export interface Entity {
	id: string;
	position: Position;
	size: Size;
	sprite?: Sprite;
}

export interface Player extends Entity {
	direction: Direction;
	isMoving: boolean;
	speed: number;
}

export interface NPC extends Entity {
	name: string;
	label: string; // Research area: 'models' | 'tools' | 'research'
	tag: string; // Tag for filtering blog posts
	dialogue: string;
	color: string; // Fallback color for simple rendering
	building?: Building; // Associated building
}

export interface Building extends Entity {
	name: string;
	color: string;
	roofColor: string;
}

export interface Obstacle extends Entity {
	type: "tree" | "rock" | "fence" | "water" | "mailbox" | "sign" | "flower_box" | "bush";
}

export interface GameState {
	player: Player;
	npcs: NPC[];
	buildings: Building[];
	obstacles: Obstacle[];
	activeNPC: NPC | null;
	showSidebar: boolean;
}

export interface BlogPost {
	slug: string;
	title: string;
	description: string;
	publishDate: Date;
	thumbnail?: string;
	tags: string[];
	mainTags: string[];
}

export interface GameConfig {
	canvasWidth: number;
	canvasHeight: number;
	tileSize: number;
	playerSpeed: number;
	interactionDistance: number;
}
