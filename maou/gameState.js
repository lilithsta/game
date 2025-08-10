// gameState.js
export const MAP_WIDTH = 15;
export const MAP_HEIGHT = 15;
export const VIEW_RADIUS = 3;

// Tile types
export const TILE_EMPTY = 0;
export const TILE_CASTLE = 1;
export const TILE_ENEMY = 2;
export const TILE_RESOURCE_WOOD = 3;
export const TILE_RESOURCE_STONE = 4;
export const TILE_RESOURCE_FOOD = 5;

// Game state
export let tilemap = [];
export let playerPos = { x: Math.floor(MAP_WIDTH / 2), y: Math.floor(MAP_HEIGHT / 2) };

export let resources = { wood: 100, stone: 100, food: 100 };
export let heroes = 10;
export let castleLevel = 1;
