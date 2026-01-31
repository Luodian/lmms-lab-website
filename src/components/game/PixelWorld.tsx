import { useCallback, useEffect, useRef, useState } from "react";
import {
	BUILDINGS,
	COLORS,
	GAME_CONFIG,
	INITIAL_PLAYER,
	NPCS,
	OBSTACLES,
	getCollisionRects,
} from "./gameConstants";
import type { BlogPost, Direction, NPC, Player } from "./gameTypes";
import { useGameLoop } from "./useGameLoop";
import { useKeyboard } from "./useKeyboard";

interface PixelWorldProps {
	posts: BlogPost[];
}

export function PixelWorld({ posts }: PixelWorldProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [player, setPlayer] = useState<Player>(INITIAL_PLAYER);
	const [activeNPC, setActiveNPC] = useState<NPC | null>(null);
	const [showSidebar, setShowSidebar] = useState(false);
	const [nearbyNPC, setNearbyNPC] = useState<NPC | null>(null);

	const { keys, interactPressed, consumeInteract } = useKeyboard();
	const collisionRects = useRef(getCollisionRects());

	const checkCollision = useCallback(
		(x: number, y: number, width: number, height: number): boolean => {
			for (const rect of collisionRects.current) {
				if (
					x < rect.x + rect.width &&
					x + width > rect.x &&
					y < rect.y + rect.height &&
					y + height > rect.y
				) {
					return true;
				}
			}
			return false;
		},
		[],
	);

	const getNearbyNPC = useCallback((playerX: number, playerY: number): NPC | null => {
		const playerCenterX = playerX + INITIAL_PLAYER.size.width / 2;
		const playerCenterY = playerY + INITIAL_PLAYER.size.height / 2;

		for (const npc of NPCS) {
			const npcCenterX = npc.position.x + npc.size.width / 2;
			const npcCenterY = npc.position.y + npc.size.height / 2;
			const distance = Math.sqrt(
				Math.pow(playerCenterX - npcCenterX, 2) + Math.pow(playerCenterY - npcCenterY, 2),
			);
			if (distance < GAME_CONFIG.interactionDistance) {
				return npc;
			}
		}
		return null;
	}, []);

	const updateGame = useCallback(
		(deltaTime: number) => {
			if (showSidebar) return;

			let dx = 0;
			let dy = 0;
			let newDirection: Direction = player.direction;

			if (keys.up) {
				dy = -1;
				newDirection = "up";
			}
			if (keys.down) {
				dy = 1;
				newDirection = "down";
			}
			if (keys.left) {
				dx = -1;
				newDirection = "left";
			}
			if (keys.right) {
				dx = 1;
				newDirection = "right";
			}

			const isMoving = dx !== 0 || dy !== 0;

			if (isMoving) {
				const length = Math.sqrt(dx * dx + dy * dy);
				dx = (dx / length) * player.speed * deltaTime * 60;
				dy = (dy / length) * player.speed * deltaTime * 60;

				let newX = player.position.x + dx;
				let newY = player.position.y + dy;

				if (checkCollision(newX, player.position.y, player.size.width, player.size.height)) {
					newX = player.position.x;
				}
				if (checkCollision(player.position.x, newY, player.size.width, player.size.height)) {
					newY = player.position.y;
				}

				setPlayer((prev) => ({
					...prev,
					position: { x: newX, y: newY },
					direction: newDirection,
					isMoving: true,
				}));

				setNearbyNPC(getNearbyNPC(newX, newY));
			} else {
				setPlayer((prev) => ({
					...prev,
					direction: newDirection,
					isMoving: false,
				}));
			}
		},
		[keys, player, showSidebar, checkCollision, getNearbyNPC],
	);

	useGameLoop(updateGame);

	useEffect(() => {
		if (interactPressed && nearbyNPC && !showSidebar) {
			setActiveNPC(nearbyNPC);
			setShowSidebar(true);
			consumeInteract();
		}
	}, [interactPressed, nearbyNPC, showSidebar, consumeInteract]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.imageSmoothingEnabled = false;

		ctx.fillStyle = COLORS.grass;
		ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

		for (let x = 0; x < GAME_CONFIG.canvasWidth; x += 64) {
			for (let y = 0; y < GAME_CONFIG.canvasHeight; y += 64) {
				if ((x + y) % 128 === 0) {
					ctx.fillStyle = COLORS.grassDark;
					ctx.fillRect(x, y, 32, 32);
				}
			}
		}

		ctx.fillStyle = COLORS.path;
		ctx.fillRect(100, GAME_CONFIG.canvasHeight - 80, GAME_CONFIG.canvasWidth - 200, 48);

		BUILDINGS.forEach((building) => {
			ctx.fillStyle = building.color;
			ctx.fillRect(
				building.position.x,
				building.position.y + 32,
				building.size.width,
				building.size.height - 32,
			);

			ctx.fillStyle = building.roofColor;
			ctx.beginPath();
			ctx.moveTo(building.position.x - 8, building.position.y + 32);
			ctx.lineTo(building.position.x + building.size.width / 2, building.position.y);
			ctx.lineTo(building.position.x + building.size.width + 8, building.position.y + 32);
			ctx.closePath();
			ctx.fill();

			ctx.fillStyle = "#4a3728";
			ctx.fillRect(
				building.position.x + building.size.width / 2 - 16,
				building.position.y + building.size.height - 40,
				32,
				40,
			);

			ctx.fillStyle = "#87ceeb";
			ctx.fillRect(building.position.x + 16, building.position.y + 48, 24, 20);
			ctx.fillRect(
				building.position.x + building.size.width - 40,
				building.position.y + 48,
				24,
				20,
			);
		});

		OBSTACLES.forEach((obstacle) => {
			if (obstacle.type === "tree") {
				ctx.fillStyle = "#5d4037";
				ctx.fillRect(
					obstacle.position.x + obstacle.size.width / 2 - 6,
					obstacle.position.y + obstacle.size.height - 24,
					12,
					24,
				);

				ctx.fillStyle = "#2e7d32";
				ctx.beginPath();
				ctx.arc(
					obstacle.position.x + obstacle.size.width / 2,
					obstacle.position.y + 20,
					24,
					0,
					Math.PI * 2,
				);
				ctx.fill();

				ctx.fillStyle = "#388e3c";
				ctx.beginPath();
				ctx.arc(
					obstacle.position.x + obstacle.size.width / 2 - 8,
					obstacle.position.y + 28,
					16,
					0,
					Math.PI * 2,
				);
				ctx.fill();
			} else if (obstacle.type === "rock") {
				ctx.fillStyle = "#757575";
				ctx.beginPath();
				ctx.ellipse(
					obstacle.position.x + obstacle.size.width / 2,
					obstacle.position.y + obstacle.size.height / 2,
					obstacle.size.width / 2,
					obstacle.size.height / 2,
					0,
					0,
					Math.PI * 2,
				);
				ctx.fill();
			}
		});

		NPCS.forEach((npc) => {
			ctx.fillStyle = npc.color;
			ctx.fillRect(npc.position.x, npc.position.y, npc.size.width, npc.size.height);

			ctx.fillStyle = "#ffdbac";
			ctx.beginPath();
			ctx.arc(npc.position.x + npc.size.width / 2, npc.position.y - 4, 12, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = "#3d3d3d";
			ctx.fillRect(npc.position.x + 10, npc.position.y - 8, 4, 4);
			ctx.fillRect(npc.position.x + 18, npc.position.y - 8, 4, 4);

			const isNearby = nearbyNPC?.id === npc.id;
			if (isNearby) {
				ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
				ctx.fillRect(npc.position.x - 20, npc.position.y - 44, 72, 24);
				ctx.fillStyle = "#3d3d3d";
				ctx.font = "12px sans-serif";
				ctx.textAlign = "center";
				ctx.fillText(npc.label, npc.position.x + 16, npc.position.y - 28);

				ctx.fillStyle = "#ffd700";
				ctx.font = "bold 10px sans-serif";
				ctx.fillText("[E]", npc.position.x + 16, npc.position.y - 52);
			}
		});

		const px = player.position.x;
		const py = player.position.y;

		ctx.fillStyle = "#4169e1";
		ctx.fillRect(px, py, player.size.width, player.size.height);

		ctx.fillStyle = "#ffdbac";
		ctx.beginPath();
		ctx.arc(px + player.size.width / 2, py - 4, 12, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = "#3d3d3d";
		ctx.fillRect(px + 10, py - 8, 4, 4);
		ctx.fillRect(px + 18, py - 8, 4, 4);

		ctx.fillStyle = "#8b4513";
		ctx.fillRect(px + 8, py - 16, 16, 8);
	}, [player, nearbyNPC]);

	const closeSidebar = useCallback(() => {
		setShowSidebar(false);
		setActiveNPC(null);
	}, []);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.code === "Escape" && showSidebar) {
				closeSidebar();
			}
		};
		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [showSidebar, closeSidebar]);

	const filteredPosts = activeNPC
		? posts.filter(
				(post) =>
					post.tags.some((tag) => tag.toLowerCase() === activeNPC.tag.toLowerCase()) ||
					post.mainTags.some((tag) => tag.toLowerCase() === activeNPC.tag.toLowerCase()),
			)
		: [];

	return (
		<div className="relative w-full min-h-screen bg-[#1a1a2e] flex items-center justify-center overflow-hidden">
			<div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 rounded-lg p-3 text-sm">
				<p className="font-bold mb-1">Controls</p>
				<p>WASD / Arrows - Move</p>
				<p>E / Space - Interact</p>
			</div>

			<canvas
				ref={canvasRef}
				width={GAME_CONFIG.canvasWidth}
				height={GAME_CONFIG.canvasHeight}
				className="border-4 border-[#4a3728] rounded-lg shadow-2xl"
				style={{ imageRendering: "pixelated" }}
			/>

			<div
				className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out z-50 ${
					showSidebar ? "translate-x-0" : "translate-x-full"
				}`}
			>
				{activeNPC && (
					<div className="h-full flex flex-col">
						<div className="p-6 text-white" style={{ backgroundColor: activeNPC.color }}>
							<button
								onClick={closeSidebar}
								className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
							<h2 className="text-2xl font-bold">{activeNPC.label}</h2>
							<p className="mt-2 opacity-90">{activeNPC.dialogue}</p>
						</div>

						<div className="flex-1 overflow-y-auto p-4">
							<h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
								Related Posts ({filteredPosts.length})
							</h3>

							{filteredPosts.length === 0 ? (
								<p className="text-gray-500 dark:text-gray-400">
									No posts found for this category.
								</p>
							) : (
								<ul className="space-y-4">
									{filteredPosts.map((post) => (
										<li key={post.slug}>
											<a
												href={`/posts/${post.slug}/`}
												className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
											>
												{post.thumbnail && (
													<img
														src={post.thumbnail}
														alt={post.title}
														className="w-full h-32 object-cover rounded mb-3"
													/>
												)}
												<h4 className="font-semibold text-gray-800 dark:text-gray-200">
													{post.title}
												</h4>
												<p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
													{post.description}
												</p>
												<p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
													{new Date(post.publishDate).toLocaleDateString()}
												</p>
											</a>
										</li>
									))}
								</ul>
							)}
						</div>

						<div className="p-4 border-t border-gray-200 dark:border-gray-700">
							<button
								onClick={closeSidebar}
								className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
							>
								Close (ESC)
							</button>
						</div>
					</div>
				)}
			</div>

			{showSidebar && <div className="fixed inset-0 bg-black/30 z-40" onClick={closeSidebar} />}
		</div>
	);
}

export default PixelWorld;
