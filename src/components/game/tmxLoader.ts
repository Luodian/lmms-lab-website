// TMX Map Loader - Parses Tiled TMX format maps

export interface TMXTileset {
	firstgid: number;
	name: string;
	source?: string | undefined;
}

export interface TMXLayer {
	id: number;
	name: string;
	width: number;
	height: number;
	data: number[]; // Flat array for performance
}

export interface TMXMap {
	width: number;
	height: number;
	tileWidth: number;
	tileHeight: number;
	layers: TMXLayer[];
	tilesets: TMXTileset[];
}

/**
 * Load and parse a TMX file from URL
 */
export async function loadTMX(url: string): Promise<TMXMap> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to load TMX: ${response.status} ${response.statusText}`);
	}
	const text = await response.text();
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(text, "text/xml");

	const map = xmlDoc.querySelector("map");
	if (!map) throw new Error("Invalid TMX file: no map element");

	const width = Number.parseInt(map.getAttribute("width") || "0", 10);
	const height = Number.parseInt(map.getAttribute("height") || "0", 10);
	const tileWidth = Number.parseInt(map.getAttribute("tilewidth") || "32", 10);
	const tileHeight = Number.parseInt(map.getAttribute("tileheight") || "32", 10);

	// Parse tilesets
	const tilesets: TMXTileset[] = [];
	const tilesetElements = xmlDoc.querySelectorAll("tileset");
	for (const ts of Array.from(tilesetElements)) {
		const source = ts.getAttribute("source") || undefined;
		let name = ts.getAttribute("name") || "";
		if (!name && source) {
			name = source.replace(/\[.*?\]/g, "").replace(".tsx", "");
		}
		tilesets.push({
			firstgid: Number.parseInt(ts.getAttribute("firstgid") || "1", 10),
			name,
			source,
		});
	}
	tilesets.sort((a, b) => b.firstgid - a.firstgid);

	// Parse layers
	const layers: TMXLayer[] = [];
	const layerElements = xmlDoc.querySelectorAll("layer");

	for (const layerEl of Array.from(layerElements)) {
		const name = layerEl.getAttribute("name") || "unnamed";
		const id = Number.parseInt(layerEl.getAttribute("id") || "0", 10);
		const layerWidth = Number.parseInt(layerEl.getAttribute("width") || String(width), 10);
		const layerHeight = Number.parseInt(layerEl.getAttribute("height") || String(height), 10);
		const dataEl = layerEl.querySelector("data");

		if (dataEl) {
			const encoding = dataEl.getAttribute("encoding");
			if (encoding === "csv") {
				const csvContent = dataEl.textContent || "";
				const flatData = csvContent
					.split(",")
					.map((s) => Number.parseInt(s.trim(), 10))
					.filter((n) => !Number.isNaN(n));

				layers.push({
					id,
					name,
					width: layerWidth,
					height: layerHeight,
					data: flatData,
				});
			} else if (!encoding) {
				const tileElements = dataEl.querySelectorAll("tile");
				const data = Array.from(tileElements).map((t) =>
					Number.parseInt(t.getAttribute("gid") || "0", 10),
				);
				layers.push({
					id,
					name,
					width: layerWidth,
					height: layerHeight,
					data,
				});
			}
		}
	}

	return {
		width,
		height,
		tileWidth,
		tileHeight,
		layers,
		tilesets,
	};
}

/**
 * Get tile at specific position in a layer
 */
export function getTileAt(layer: TMXLayer, x: number, y: number): number {
	if (x < 0 || x >= layer.width || y < 0 || y >= layer.height) {
		return 0;
	}
	return layer.data[y * layer.width + x] || 0;
}

/**
 * Find which tileset a tile ID belongs to
 */
export function findTilesetForGid(
	tilesets: TMXTileset[],
	gid: number,
): { tileset: TMXTileset; localId: number } | null {
	if (gid === 0) return null;

	for (const tileset of tilesets) {
		if (gid >= tileset.firstgid) {
			return {
				tileset,
				localId: gid - tileset.firstgid,
			};
		}
	}
	return null;
}

/**
 * Get a layer by name from the TMX map
 */
export function getLayerByName(map: TMXMap, name: string): TMXLayer | undefined {
	return map.layers.find((layer) => layer.name === name);
}

/**
 * Check if a world position collides with any tile in the specified collision layers
 * @param map The TMX map
 * @param worldX World X coordinate (pixels)
 * @param worldY World Y coordinate (pixels)
 * @param collisionLayers Array of layer names to check for collision
 * @param scale Optional scale factor for tiles (default: 1)
 * @returns true if position collides with a non-empty tile in any collision layer
 */
export function checkTileCollision(
	map: TMXMap,
	worldX: number,
	worldY: number,
	collisionLayers: string[],
	scale = 1,
): boolean {
	const scaledTileWidth = map.tileWidth * scale;
	const scaledTileHeight = map.tileHeight * scale;
	const tileX = Math.floor(worldX / scaledTileWidth);
	const tileY = Math.floor(worldY / scaledTileHeight);

	for (const layerName of collisionLayers) {
		const layer = getLayerByName(map, layerName);
		if (layer) {
			const gid = getTileAt(layer, tileX, tileY);
			if (gid !== 0) {
				return true;
			}
		}
	}
	return false;
}

export function checkRectTileCollision(
	map: TMXMap,
	x: number,
	y: number,
	width: number,
	height: number,
	collisionLayers: string[],
	padding = 4,
	scale = 1,
): boolean {
	const left = x + padding;
	const right = x + width - padding;
	const top = y + height / 2;
	const bottom = y + height - padding;
	const centerX = x + width / 2;
	const centerY = y + height * 0.75;

	const pointsToCheck: [number, number][] = [
		[left, top],
		[right, top],
		[left, bottom],
		[right, bottom],
		[centerX, centerY],
		[centerX, bottom],
	];

	for (const point of pointsToCheck) {
		if (checkTileCollision(map, point[0], point[1], collisionLayers, scale)) {
			return true;
		}
	}
	return false;
}
