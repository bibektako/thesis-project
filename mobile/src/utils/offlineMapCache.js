import * as FileSystem from "expo-file-system";

const TILE_CACHE_DIR = `${FileSystem.cacheDirectory}map-tiles/`;
const OSM_TILE_URL = "https://tile.openstreetmap.org";

/**
 * Ensure tile cache directory exists
 */
const ensureCacheDir = async () => {
    const dirInfo = await FileSystem.getInfoAsync(TILE_CACHE_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(TILE_CACHE_DIR, { intermediates: true });
    }
};

/**
 * Convert lat/lng to tile coordinates for a given zoom level
 */
const latLngToTile = (lat, lng, zoom) => {
    const n = Math.pow(2, zoom);
    const x = Math.floor(((lng + 180) / 360) * n);
    const latRad = (lat * Math.PI) / 180;
    const y = Math.floor(
        ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
    );
    return { x, y };
};

/**
 * Get tile file path in local cache
 */
const getTilePath = (x, y, z) => {
    return `${TILE_CACHE_DIR}${z}_${x}_${y}.png`;
};

/**
 * Download a single tile to cache
 */
const downloadTile = async (x, y, z) => {
    const tilePath = getTilePath(x, y, z);
    const tileInfo = await FileSystem.getInfoAsync(tilePath);

    if (tileInfo.exists) {
        return tilePath; // Already cached
    }

    const url = `${OSM_TILE_URL}/${z}/${x}/${y}.png`;
    try {
        await FileSystem.downloadAsync(url, tilePath);
        return tilePath;
    } catch (error) {
        console.warn(`Failed to cache tile ${z}/${x}/${y}:`, error.message);
        return null;
    }
};

/**
 * Cache tiles for a route corridor at specified zoom levels
 * @param {Array} routePoints - Array of {latitude, longitude}
 * @param {Array} zoomLevels - Zoom levels to cache (default: [13, 14, 15, 16])
 */
export const cacheTilesForRoute = async (
    routePoints,
    zoomLevels = [13, 14, 15, 16],
    onProgress = null
) => {
    if (!routePoints || routePoints.length === 0) return;

    await ensureCacheDir();

    // Collect all unique tiles needed
    const tilesToDownload = new Set();

    for (const point of routePoints) {
        for (const zoom of zoomLevels) {
            const tile = latLngToTile(point.latitude, point.longitude, zoom);
            // Add surrounding tiles for buffer
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    tilesToDownload.add(`${zoom}_${tile.x + dx}_${tile.y + dy}`);
                }
            }
        }
    }

    const totalTiles = tilesToDownload.size;
    let downloaded = 0;

    // Download in batches of 5 to avoid overwhelming the network
    const tiles = Array.from(tilesToDownload);
    const batchSize = 5;

    for (let i = 0; i < tiles.length; i += batchSize) {
        const batch = tiles.slice(i, i + batchSize);
        await Promise.all(
            batch.map(async (tileKey) => {
                const [z, x, y] = tileKey.split("_").map(Number);
                await downloadTile(x, y, z);
                downloaded++;
                if (onProgress) {
                    onProgress(downloaded, totalTiles);
                }
            })
        );
    }

    return { totalTiles, downloaded };
};

/**
 * Get a cached tile URL, falling back to online URL
 * @returns {string} Local file URI if cached, otherwise online URL
 */
export const getCachedTileUrl = async (x, y, z) => {
    const tilePath = getTilePath(x, y, z);
    const tileInfo = await FileSystem.getInfoAsync(tilePath);

    if (tileInfo.exists) {
        return tilePath;
    }

    return `${OSM_TILE_URL}/${z}/${x}/${y}.png`;
};

/**
 * Get cache size info
 */
export const getCacheInfo = async () => {
    try {
        const dirInfo = await FileSystem.getInfoAsync(TILE_CACHE_DIR);
        if (!dirInfo.exists) return { exists: false, size: 0 };
        return { exists: true, uri: TILE_CACHE_DIR };
    } catch {
        return { exists: false, size: 0 };
    }
};

/**
 * Clear all cached tiles
 */
export const clearTileCache = async () => {
    try {
        const dirInfo = await FileSystem.getInfoAsync(TILE_CACHE_DIR);
        if (dirInfo.exists) {
            await FileSystem.deleteAsync(TILE_CACHE_DIR, { idempotent: true });
        }
    } catch (error) {
        console.warn("Failed to clear tile cache:", error.message);
    }
};
