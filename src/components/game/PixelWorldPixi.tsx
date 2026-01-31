import { Application, extend, useTick } from "@pixi/react";
import * as PIXI from "pixi.js";
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	BUILDINGS,
	COLLISION_LAYERS,
	COLORS,
	GAME_CONFIG,
	INITIAL_PLAYER,
	NPCS,
	TILESETS,
} from "./gameConstants";
import type { BlogPost, Direction, NPC } from "./gameTypes";
import { type TMXMap, checkRectTileCollision, getTileAt, loadTMX } from "./tmxLoader";
import { useKeyboard } from "./useKeyboard";

extend({
	Container: PIXI.Container,
	Sprite: PIXI.Sprite,
	Graphics: PIXI.Graphics,
	Text: PIXI.Text,
});

PIXI.TextureSource.defaultOptions.scaleMode = "nearest";

interface PixelWorldProps {
	posts: BlogPost[];
}

const ASSETS = {
	FOLK: "/assets/sprites/32x32folk.png",
	PLAYER: "/assets/sprites/sprout-lands/character.png",
	SERENE: "/assets/tiles/Serene.png",
};

const CHAR_SIZE = 32;
const PLAYER_FRAME_SIZE = 48;
const NPC_IDLE_SPEED = 0.03;
const PLAYER_SPEED = 2.5;
const MAP_URL = "/assets/tiles/sprout-lands/village.tmx";
const TILE_SCALE = 2;

const AnimatedCharacter = ({
	textures,
	isPlaying,
	animationSpeed,
	x,
	y,
	width,
	height,
}: {
	textures: PIXI.Texture[];
	isPlaying: boolean;
	animationSpeed: number;
	x: number;
	y: number;
	width: number;
	height: number;
}) => {
	const [frameIndex, setFrameIndex] = useState(0);
	const timerRef = useRef(0);

	useTick((ticker) => {
		if (isPlaying && textures.length > 1) {
			timerRef.current += ticker.deltaTime * animationSpeed;
			if (timerRef.current >= 1) {
				setFrameIndex((prev) => (prev + 1) % textures.length);
				timerRef.current = 0;
			}
		} else if (!isPlaying) {
			setFrameIndex(textures.length > 1 ? 1 : 0);
		}
	});

	const texture = textures[frameIndex % textures.length] || textures[0] || PIXI.Texture.EMPTY;
	return <pixiSprite texture={texture} x={x} y={y} width={width} height={height} />;
};

const WalkingCharacter = ({
	textures,
	isMoving,
	animTimer,
	x,
	y,
	width,
	height,
}: {
	textures: PIXI.Texture[];
	isMoving: boolean;
	animTimer: number;
	x: number;
	y: number;
	width: number;
	height: number;
}) => {
	let frameIndex = 0;
	if (isMoving && textures.length >= 2) {
		const walkCycle = Math.floor(animTimer * 6) % 2;
		frameIndex = walkCycle;
	}
	const texture = textures[frameIndex] || textures[0] || PIXI.Texture.EMPTY;
	return <pixiSprite texture={texture} x={x} y={y} width={width} height={height} />;
};

const BouncingPrompt = ({ x, baseY }: { x: number; baseY: number }) => {
	const [offsetY, setOffsetY] = useState(0);
	const timeRef = useRef(0);

	useTick((ticker) => {
		timeRef.current += ticker.deltaTime * 0.1;
		setOffsetY(Math.sin(timeRef.current) * 3);
	});

	return (
		<pixiText
			text="[E]"
			x={x}
			y={baseY + offsetY}
			anchor={0.5}
			style={{
				fontFamily: '"Press Start 2P", cursive',
				fontSize: 10,
				fill: COLORS.svAccent,
				stroke: { width: 2, color: "black" },
				align: "center",
			}}
		/>
	);
};

const TMXTile = memo(
	({
		texture,
		frame,
		x,
		y,
		width,
		height,
	}: {
		texture: PIXI.Texture;
		frame: PIXI.Rectangle;
		x: number;
		y: number;
		width: number;
		height: number;
	}) => {
		const tileTexture = useMemo(() => {
			return new PIXI.Texture({
				source: texture.source,
				frame: frame,
			});
		}, [texture, frame]);

		return <pixiSprite texture={tileTexture} x={x} y={y} width={width} height={height} />;
	},
);

const TMXMapRenderer = memo(
	({
		tmxMap,
		tilesetTextures,
		camera,
	}: {
		tmxMap: TMXMap;
		tilesetTextures: Record<string, PIXI.Texture>;
		camera: { x: number; y: number };
	}) => {
		const visibleTiles = useMemo(() => {
			const tiles: React.ReactElement[] = [];
			const scaledTileW = tmxMap.tileWidth * TILE_SCALE;
			const scaledTileH = tmxMap.tileHeight * TILE_SCALE;

			const startX = Math.floor(camera.x / scaledTileW);
			const startY = Math.floor(camera.y / scaledTileH);
			const endX = startX + Math.ceil(GAME_CONFIG.canvasWidth / scaledTileW) + 1;
			const endY = startY + Math.ceil(GAME_CONFIG.canvasHeight / scaledTileH) + 1;

			const clampStartX = Math.max(0, startX);
			const clampStartY = Math.max(0, startY);
			const clampEndX = Math.min(tmxMap.width, endX);
			const clampEndY = Math.min(tmxMap.height, endY);

			for (const layer of tmxMap.layers) {
				for (let y = clampStartY; y < clampEndY; y++) {
					for (let x = clampStartX; x < clampEndX; x++) {
						const gid = getTileAt(layer, x, y);
						if (gid === 0) continue;

						let tileset: (typeof TILESETS)[number] | null = null;
						for (let i = TILESETS.length - 1; i >= 0; i--) {
							const ts = TILESETS[i];
							if (ts && gid >= ts.firstgid) {
								tileset = ts;
								break;
							}
						}
						if (!tileset) continue;

						const texture = tilesetTextures[tileset.name];
						if (!texture) continue;

						const localId = gid - tileset.firstgid;
						const tilesPerRow = tileset.imageWidth / tileset.tileWidth;
						const tileX = localId % tilesPerRow;
						const tileY = Math.floor(localId / tilesPerRow);

						const frame = new PIXI.Rectangle(
							tileX * tileset.tileWidth,
							tileY * tileset.tileHeight,
							tileset.tileWidth,
							tileset.tileHeight,
						);

						tiles.push(
							<TMXTile
								key={`${layer.name}-${x}-${y}`}
								texture={texture}
								frame={frame}
								x={x * scaledTileW - camera.x}
								y={y * scaledTileH - camera.y}
								width={scaledTileW}
								height={scaledTileH}
							/>,
						);
					}
				}
			}

			return tiles;
		}, [tmxMap, tilesetTextures, camera]);

		return <pixiContainer>{visibleTiles}</pixiContainer>;
	},
);

const ControlsPanel = () => (
	<pixiContainer x={16} y={GAME_CONFIG.canvasHeight - 100}>
		<pixiGraphics
			draw={(g: PIXI.Graphics) => {
				g.clear();
				g.rect(0, 0, 220, 84);
				g.fill({ color: 0x000000, alpha: 0.6 });
				g.stroke({ width: 2, color: COLORS.svPanelBorder });
			}}
		/>
		<pixiText
			text="CONTROLS"
			x={16}
			y={16}
			style={{
				fontFamily: '"Press Start 2P", cursive',
				fontSize: 12,
				fill: COLORS.svAccent,
				align: "left",
			}}
		/>
		<pixiText
			text="WASD/ARROWS: MOVE"
			x={16}
			y={38}
			style={{
				fontFamily: '"Press Start 2P", cursive',
				fontSize: 10,
				fill: COLORS.svText,
				align: "left",
			}}
		/>
		<pixiText
			text="E/SPACE: INTERACT"
			x={16}
			y={58}
			style={{
				fontFamily: '"Press Start 2P", cursive',
				fontSize: 10,
				fill: COLORS.svText,
				align: "left",
			}}
		/>
	</pixiContainer>
);

interface PlayerState {
	x: number;
	y: number;
	direction: Direction;
	isMoving: boolean;
	animTimer: number;
}

const checkCollision = (
	x: number,
	y: number,
	width: number,
	height: number,
	mapWidth: number,
	mapHeight: number,
	tmxMap: TMXMap | null,
): boolean => {
	const padding = 8;
	const playerRect = {
		left: x + padding,
		right: x + width - padding,
		top: y + height / 2,
		bottom: y + height,
	};

	for (const building of BUILDINGS) {
		const buildingRect = {
			left: building.position.x - 8,
			right: building.position.x + building.size.width + 8,
			top: building.position.y,
			bottom: building.position.y + building.size.height,
		};

		if (
			playerRect.left < buildingRect.right &&
			playerRect.right > buildingRect.left &&
			playerRect.top < buildingRect.bottom &&
			playerRect.bottom > buildingRect.top
		) {
			return true;
		}
	}

	if (
		playerRect.left < 0 ||
		playerRect.right > mapWidth ||
		playerRect.top < 0 ||
		playerRect.bottom > mapHeight
	) {
		return true;
	}

	if (
		tmxMap &&
		checkRectTileCollision(tmxMap, x, y, width, height, COLLISION_LAYERS, 4, TILE_SCALE)
	) {
		return true;
	}

	return false;
};

const GameScene = ({
	textures,
	tilesetTextures,
	tmxMap,
	onShowSidebar,
	showSidebar,
}: {
	textures: { folk: PIXI.Texture; player: PIXI.Texture; serene: PIXI.Texture };
	tilesetTextures: Record<string, PIXI.Texture>;
	tmxMap: TMXMap;
	onShowSidebar: (npc: NPC) => void;
	showSidebar: boolean;
}) => {
	const [playerState, setPlayerState] = useState<PlayerState>({
		x: INITIAL_PLAYER.position.x,
		y: INITIAL_PLAYER.position.y,
		direction: INITIAL_PLAYER.direction,
		isMoving: false,
		animTimer: 0,
	});
	const [nearbyNPC, setNearbyNPC] = useState<NPC | null>(null);
	const [camera, setCamera] = useState({ x: 0, y: 0 });

	const { keys, interactPressed, consumeInteract } = useKeyboard();

	const getNearbyNPC = useCallback((playerX: number, playerY: number): NPC | null => {
		const playerCenterX = playerX + CHAR_SIZE / 2;
		const playerCenterY = playerY + CHAR_SIZE / 2;

		for (const npc of NPCS) {
			const npcCenterX = npc.position.x + npc.size.width / 2;
			const npcCenterY = npc.position.y + npc.size.height / 2;
			const distance = Math.sqrt(
				(playerCenterX - npcCenterX) ** 2 + (playerCenterY - npcCenterY) ** 2,
			);
			if (distance < GAME_CONFIG.interactionDistance) return npc;
		}
		return null;
	}, []);

	useTick((ticker) => {
		if (showSidebar) return;

		setPlayerState((prev) => {
			let { x, y, direction, isMoving, animTimer } = prev;
			let dx = 0;
			let dy = 0;

			if (keys.up) {
				dy = -PLAYER_SPEED;
				direction = "up";
			} else if (keys.down) {
				dy = PLAYER_SPEED;
				direction = "down";
			}
			if (keys.left) {
				dx = -PLAYER_SPEED;
				direction = "left";
			} else if (keys.right) {
				dx = PLAYER_SPEED;
				direction = "right";
			}

			isMoving = dx !== 0 || dy !== 0;

			const mapWidth = tmxMap.width * tmxMap.tileWidth * TILE_SCALE;
			const mapHeight = tmxMap.height * tmxMap.tileHeight * TILE_SCALE;

			if (isMoving) {
				const newX = x + dx * ticker.deltaTime;
				const newY = y + dy * ticker.deltaTime;

				if (!checkCollision(newX, y, CHAR_SIZE, CHAR_SIZE, mapWidth, mapHeight, tmxMap)) {
					x = newX;
				}
				if (!checkCollision(x, newY, CHAR_SIZE, CHAR_SIZE, mapWidth, mapHeight, tmxMap)) {
					y = newY;
				}

				animTimer += ticker.deltaTime * 0.1;
			}

			return { x, y, direction, isMoving, animTimer };
		});

		setNearbyNPC(getNearbyNPC(playerState.x, playerState.y));
	});

	useEffect(() => {
		const mapWidth = tmxMap.width * tmxMap.tileWidth * TILE_SCALE;
		const mapHeight = tmxMap.height * tmxMap.tileHeight * TILE_SCALE;

		let camX = playerState.x + CHAR_SIZE / 2 - GAME_CONFIG.canvasWidth / 2;
		let camY = playerState.y + CHAR_SIZE / 2 - GAME_CONFIG.canvasHeight / 2;

		camX = Math.max(0, Math.min(camX, mapWidth - GAME_CONFIG.canvasWidth));
		camY = Math.max(0, Math.min(camY, mapHeight - GAME_CONFIG.canvasHeight));

		setCamera({ x: camX, y: camY });
	}, [playerState.x, playerState.y, tmxMap]);

	useEffect(() => {
		if (interactPressed && nearbyNPC && !showSidebar) {
			onShowSidebar(nearbyNPC);
			consumeInteract();
		}
	}, [interactPressed, nearbyNPC, showSidebar, consumeInteract, onShowSidebar]);

	const getCharacterTextures = useCallback(
		(row: number, col: number, direction: Direction) => {
			const baseX = col * CHAR_SIZE * 3;
			const baseY = row * CHAR_SIZE * 4;
			const dirOffset = { down: 0, left: 1, right: 2, up: 3 }[direction];
			const y = baseY + dirOffset * CHAR_SIZE;

			return [0, 1, 2].map(
				(i) =>
					new PIXI.Texture({
						source: textures.folk.source,
						frame: new PIXI.Rectangle(baseX + i * CHAR_SIZE, y, CHAR_SIZE, CHAR_SIZE),
					}),
			);
		},
		[textures.folk],
	);

	const getPlayerTextures = useCallback(
		(direction: Direction, isWalking: boolean) => {
			const rowMap: Record<Direction, number> = {
				down: 0,
				up: 1,
				left: 2,
				right: 3,
			};
			const row = rowMap[direction];
			const baseY = row * PLAYER_FRAME_SIZE;

			const startCol = isWalking ? 2 : 0;

			return [0, 1].map(
				(i) =>
					new PIXI.Texture({
						source: textures.player.source,
						frame: new PIXI.Rectangle(
							(startCol + i) * PLAYER_FRAME_SIZE,
							baseY,
							PLAYER_FRAME_SIZE,
							PLAYER_FRAME_SIZE,
						),
					}),
			);
		},
		[textures.player],
	);

	const playerTextures = useMemo(
		() => getPlayerTextures(playerState.direction, playerState.isMoving),
		[playerState.direction, playerState.isMoving, getPlayerTextures],
	);

	const getNpcTextures = useCallback(
		(npc: NPC) => {
			const colMap: Record<string, number> = {
				"npc-models": 1,
				"npc-tools": 2,
				"npc-research": 3,
			};
			return getCharacterTextures(0, colMap[npc.id] || 0, "down");
		},
		[getCharacterTextures],
	);

	const getHouseTexture = useCallback(
		(roofColor: string) => {
			let tileY = 29;
			if (roofColor === COLORS.roofBlue) tileY = 51;
			else if (roofColor === COLORS.roofPurple) tileY = 40;

			return new PIXI.Texture({
				source: textures.serene.source,
				frame: new PIXI.Rectangle(0, tileY * 32, 48, 80),
			});
		},
		[textures.serene],
	);

	const entities = [
		{
			id: "player",
			y: playerState.y + CHAR_SIZE,
			render: () => (
				<WalkingCharacter
					key="player"
					textures={playerTextures}
					isMoving={playerState.isMoving}
					animTimer={playerState.animTimer}
					x={playerState.x - camera.x}
					y={playerState.y - camera.y}
					width={CHAR_SIZE}
					height={CHAR_SIZE}
				/>
			),
		},
		...NPCS.map((npc) => ({
			id: npc.id,
			y: npc.position.y + npc.size.height,
			render: () => (
				<pixiContainer key={npc.id} x={npc.position.x - camera.x} y={npc.position.y - camera.y}>
					<AnimatedCharacter
						textures={getNpcTextures(npc)}
						isPlaying={true}
						animationSpeed={NPC_IDLE_SPEED}
						x={0}
						y={0}
						width={CHAR_SIZE}
						height={CHAR_SIZE}
					/>
					<pixiGraphics
						draw={(g: PIXI.Graphics) => {
							g.clear();
							const width = npc.label.length * 8 + 8;
							g.roundRect(CHAR_SIZE / 2 - width / 2, -18, width, 14, 2);
							g.fill({ color: COLORS.svPanel, alpha: 0.8 });
							g.stroke({ width: 1, color: COLORS.svPanelBorder });
						}}
					/>
					<pixiText
						text={npc.label}
						x={CHAR_SIZE / 2}
						y={-11}
						anchor={0.5}
						style={{
							fontFamily: '"Press Start 2P", cursive',
							fontSize: 8,
							fill: COLORS.svText,
						}}
					/>
					{nearbyNPC?.id === npc.id && <BouncingPrompt x={CHAR_SIZE / 2} baseY={-32} />}
				</pixiContainer>
			),
		})),
		...BUILDINGS.map((building) => ({
			id: building.id,
			y: building.position.y + building.size.height,
			render: () => (
				<pixiSprite
					key={building.id}
					texture={getHouseTexture(building.roofColor)}
					x={building.position.x - camera.x}
					y={building.position.y - camera.y}
					width={building.size.width}
					height={building.size.height}
				/>
			),
		})),
	].sort((a, b) => a.y - b.y);

	return (
		<pixiContainer>
			<TMXMapRenderer tmxMap={tmxMap} tilesetTextures={tilesetTextures} camera={camera} />
			{entities.map((e) => (
				<pixiContainer key={e.id}>{e.render()}</pixiContainer>
			))}
			<ControlsPanel />
		</pixiContainer>
	);
};

export function PixelWorldPixi({ posts }: PixelWorldProps) {
	const [loaded, setLoaded] = useState(false);
	const [textures, setTextures] = useState<{
		folk: PIXI.Texture;
		player: PIXI.Texture;
		serene: PIXI.Texture;
	} | null>(null);
	const [tilesetTextures, setTilesetTextures] = useState<Record<string, PIXI.Texture>>({});
	const [tmxMap, setTmxMap] = useState<TMXMap | null>(null);
	const [activeNPC, setActiveNPC] = useState<NPC | null>(null);
	const [showSidebar, setShowSidebar] = useState(false);

	useEffect(() => {
		const loadAssets = async () => {
			try {
				const [folk, player, serene, mapData] = await Promise.all([
					PIXI.Assets.load(ASSETS.FOLK),
					PIXI.Assets.load(ASSETS.PLAYER),
					PIXI.Assets.load(ASSETS.SERENE),
					loadTMX(MAP_URL),
				]);

				const tilesetPromises = TILESETS.map(async (tileset) => {
					const texture = await PIXI.Assets.load(tileset.image);
					return { name: tileset.name, texture };
				});

				const tilesetsLoaded = await Promise.all(tilesetPromises);
				const tilesetMap: Record<string, PIXI.Texture> = {};
				for (const t of tilesetsLoaded) {
					tilesetMap[t.name] = t.texture;
				}

				setTextures({ folk, player, serene });
				setTmxMap(mapData);
				setTilesetTextures(tilesetMap);
				setLoaded(true);
			} catch (e) {
				console.error("Failed to load assets", e);
			}
		};
		loadAssets();
	}, []);

	const handleShowSidebar = useCallback((npc: NPC) => {
		setActiveNPC(npc);
		setShowSidebar(true);
	}, []);

	const handleCloseSidebar = useCallback(() => {
		setShowSidebar(false);
		setActiveNPC(null);
	}, []);

	const filteredPosts = useMemo(() => {
		if (!activeNPC) return [];
		return posts.filter(
			(post) =>
				post.tags.some((tag) => tag.toLowerCase() === activeNPC.tag.toLowerCase()) ||
				post.mainTags.some((tag) => tag.toLowerCase() === activeNPC.tag.toLowerCase()),
		);
	}, [activeNPC, posts]);

	return (
		<div className="relative w-full min-h-screen bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
			{loaded && textures && tmxMap ? (
				<div className="relative p-2 bg-[#4a4a6a] shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]">
					<div className="border-4 border-[#2d2d44]">
						<Application
							width={GAME_CONFIG.canvasWidth}
							height={GAME_CONFIG.canvasHeight}
							backgroundColor={COLORS.grass}
							className="block"
						>
							<GameScene
								textures={textures}
								tilesetTextures={tilesetTextures}
								tmxMap={tmxMap}
								onShowSidebar={handleShowSidebar}
								showSidebar={showSidebar}
							/>
						</Application>
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center">
					<div className="w-12 h-12 border-4 border-[#e8c170] border-t-transparent rounded-none animate-spin mb-4 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]" />
					<div
						className="text-[#f4e4bc] text-lg animate-pulse"
						style={{ fontFamily: '"Press Start 2P", cursive' }}
					>
						LOADING...
					</div>
				</div>
			)}

			<div
				className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#2d2d44] border-l-4 border-[#4a4a6a] shadow-2xl transform transition-transform duration-300 ease-out z-50 ${
					showSidebar ? "translate-x-0" : "translate-x-full"
				}`}
				style={{ fontFamily: '"Press Start 2P", cursive' }}
			>
				{activeNPC && (
					<div className="h-full flex flex-col">
						<div
							className="p-6 text-[#f4e4bc] border-b-4 border-[#4a4a6a] relative"
							style={{ backgroundColor: activeNPC.color }}
						>
							<div className="absolute inset-0 bg-black/20 pointer-events-none" />
							<div className="relative z-10">
								<button
									type="button"
									onClick={handleCloseSidebar}
									className="absolute -top-2 -right-2 text-white hover:text-[#e8c170] transition-colors text-xl bg-[#2d2d44] border-2 border-[#4a4a6a] w-8 h-8 flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]"
								>
									X
								</button>
								<h2 className="text-xl font-bold mb-2 shadow-black drop-shadow-md">
									{activeNPC.label}
								</h2>
								<p className="mt-2 text-xs leading-relaxed opacity-90 shadow-black drop-shadow-sm">
									{activeNPC.dialogue}
								</p>
							</div>
						</div>

						<div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
							<h3 className="text-sm font-semibold mb-6 text-[#e8c170] uppercase tracking-widest border-b-2 border-[#4a4a6a] pb-2">
								Related Posts ({filteredPosts.length})
							</h3>

							{filteredPosts.length === 0 ? (
								<p className="text-[#f4e4bc]/60 text-xs">No posts found for this category.</p>
							) : (
								<ul className="space-y-6">
									{filteredPosts.map((post) => (
										<li key={post.slug}>
											<a
												href={`/posts/${post.slug}/`}
												className="block p-4 bg-[#1a1a2e] border-2 border-[#4a4a6a] hover:border-[#e8c170] transition-all hover:-translate-y-1 shadow-[4px_4px_0_0_#000] group"
											>
												{post.thumbnail && (
													<img
														src={post.thumbnail}
														alt={post.title}
														className="w-full h-32 object-cover mb-3 border-2 border-[#4a4a6a] grayscale group-hover:grayscale-0 transition-all"
													/>
												)}
												<h4 className="font-semibold text-[#f4e4bc] text-xs mb-2 leading-snug">
													{post.title}
												</h4>
												<p className="text-[10px] text-[#7ec8e3] line-clamp-2 leading-relaxed font-sans">
													{post.description}
												</p>
												<p className="text-[8px] text-[#f4e4bc]/40 mt-2 uppercase">
													{new Date(post.publishDate).toLocaleDateString()}
												</p>
											</a>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				)}
			</div>
			{showSidebar && (
				<div
					className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
					onClick={handleCloseSidebar}
					onKeyDown={(e) => e.key === "Escape" && handleCloseSidebar()}
					role="button"
					tabIndex={0}
				/>
			)}
		</div>
	);
}

export default PixelWorldPixi;
