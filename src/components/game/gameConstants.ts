// Game configuration constants

import type { Building, GameConfig, NPC, Player } from "./gameTypes";

export const GAME_CONFIG: GameConfig = {
	canvasWidth: 960,
	canvasHeight: 640,
	tileSize: 32,
	playerSpeed: 3,
	interactionDistance: 48,
};

export interface TilesetConfig {
	firstgid: number;
	name: string;
	image: string;
	tileWidth: number;
	tileHeight: number;
	imageWidth: number;
}

export const TILESETS: TilesetConfig[] = [
	{
		firstgid: 1,
		name: "Grass",
		image: "/assets/tiles/sprout-lands/Grass.png",
		tileWidth: 16,
		tileHeight: 16,
		imageWidth: 176,
	},
	{
		firstgid: 78,
		name: "Water",
		image: "/assets/tiles/sprout-lands/Water.png",
		tileWidth: 16,
		tileHeight: 16,
		imageWidth: 64,
	},
	{
		firstgid: 82,
		name: "Paths",
		image: "/assets/tiles/sprout-lands/Paths.png",
		tileWidth: 16,
		tileHeight: 16,
		imageWidth: 64,
	},
	{
		firstgid: 98,
		name: "Hills",
		image: "/assets/tiles/sprout-lands/Hills.png",
		tileWidth: 16,
		tileHeight: 16,
		imageWidth: 176,
	},
];

const TILESETS_SORTED = [...TILESETS].sort((a, b) => b.firstgid - a.firstgid);

export function getTilesetForGid(gid: number): { tileset: TilesetConfig; localId: number } | null {
	if (gid === 0) return null;
	for (const tileset of TILESETS_SORTED) {
		if (gid >= tileset.firstgid) {
			return { tileset, localId: gid - tileset.firstgid };
		}
	}
	return null;
}

export const COLLISION_LAYERS = ["water"];

// Stardew Valley inspired color palette
export const COLORS = {
	grass: "#7ec850",
	grassDark: "#5a9a38",
	path: "#d4a574",
	pathDark: "#b8956a",
	water: "#5b9bd5",
	sky: "#87ceeb",

	// Building colors
	buildingWood: "#8b7355",
	buildingStone: "#a0a0a0",
	roofRed: "#c44536",
	roofBlue: "#4a7c9b",
	roofPurple: "#7b5e7b",

	// UI colors
	textDark: "#3d3d3d",
	textLight: "#ffffff",
	uiBackground: "#f5f0e6",
	uiBorder: "#8b7355",

	// Stardew Valley Palette
	svBackground: "#1a1a2e",
	svPanel: "#2d2d44",
	svPanelBorder: "#4a4a6a",
	svText: "#f4e4bc",
	svAccent: "#e8c170",
	svHighlight: "#7ec8e3",
};

// Initial player state - center of 960x640 map
export const INITIAL_PLAYER: Player = {
	id: "player",
	position: { x: 464, y: 320 },
	size: { width: 32, height: 32 },
	direction: "down",
	isMoving: false,
	speed: GAME_CONFIG.playerSpeed,
};

// NPC definitions for each research area - positioned for 960x640 map
export const NPCS: NPC[] = [
	{
		id: "npc-models",
		name: "Dr. Model",
		label: "Models",
		tag: "models",
		position: { x: 464, y: 180 },
		size: { width: 32, height: 32 },
		dialogue: "Welcome to the Model Lab! Here we develop state-of-the-art multimodal models.",
		color: "#e57373",
	},
	{
		id: "npc-tools",
		name: "Prof. Tool",
		label: "Tools",
		tag: "tools",
		position: { x: 200, y: 320 },
		size: { width: 32, height: 32 },
		dialogue: "The Tools Workshop! We create frameworks and utilities for AI research.",
		color: "#64b5f6",
	},
	{
		id: "npc-research",
		name: "Scholar Rex",
		label: "Research",
		tag: "research",
		position: { x: 728, y: 320 },
		size: { width: 32, height: 32 },
		dialogue: "Research Archives! Explore our latest papers and findings.",
		color: "#ba68c8",
	},
];

// Buildings for each NPC - Arranged around a town square on 960x640 map
export const BUILDINGS: Building[] = [
	{
		id: "building-models",
		name: "Model Lab",
		position: { x: 456, y: 80 },
		size: { width: 48, height: 80 },
		color: COLORS.buildingWood,
		roofColor: COLORS.roofRed,
	},
	{
		id: "building-tools",
		name: "Tools Workshop",
		position: { x: 130, y: 260 },
		size: { width: 48, height: 80 },
		color: COLORS.buildingStone,
		roofColor: COLORS.roofBlue,
	},
	{
		id: "building-research",
		name: "Research Archives",
		position: { x: 782, y: 260 },
		size: { width: 48, height: 80 },
		color: COLORS.buildingWood,
		roofColor: COLORS.roofPurple,
	},
];

export const getCollisionRects = () => {
	const collisions: { x: number; y: number; width: number; height: number }[] = [];

	for (const building of BUILDINGS) {
		collisions.push({
			x: building.position.x - 8,
			y: building.position.y - 8,
			width: building.size.width + 16,
			height: building.size.height + 16,
		});
	}

	// World boundaries
	collisions.push(
		{ x: -100, y: 0, width: 100, height: GAME_CONFIG.canvasHeight }, // Left wall
		{
			x: GAME_CONFIG.canvasWidth,
			y: 0,
			width: 100,
			height: GAME_CONFIG.canvasHeight,
		}, // Right wall
		{ x: 0, y: -100, width: GAME_CONFIG.canvasWidth, height: 100 }, // Top wall
		{
			x: 0,
			y: GAME_CONFIG.canvasHeight,
			width: GAME_CONFIG.canvasWidth,
			height: 100,
		}, // Bottom wall
	);

	return collisions;
};
