<script lang="ts">
import { onMount, onDestroy } from "svelte";
import { getWallpaperEnabled } from "@utils/setting-utils";

let wallpaperEnabled = false;
let imageUrl = "";
let isVisible = false;

function loadNewWallpaper() {
    // Adding timestamp to avoid caching
    imageUrl = `https://image.temperaturetw.top/api/random?t=${Date.now()}`;
}

function handleWallpaperChange(e: CustomEvent<boolean>) {
    wallpaperEnabled = e.detail;
    if (wallpaperEnabled && !imageUrl) {
        loadNewWallpaper();
    } else if (!wallpaperEnabled) {
        isVisible = false;
    }
}

function handleWallpaperRefresh() {
    if (wallpaperEnabled) {
        isVisible = false;
        setTimeout(() => {
            loadNewWallpaper();
        }, 500); // Wait for transition
    }
}

onMount(() => {
    wallpaperEnabled = getWallpaperEnabled();
    // onMount is only called on full page load (or refresh), not on Swup navigation
    if (wallpaperEnabled) {
        loadNewWallpaper();
    }

    window.addEventListener("wallpaper-changed", handleWallpaperChange as EventListener);
    window.addEventListener("wallpaper-refresh", handleWallpaperRefresh as EventListener);
});

onDestroy(() => {
    if (typeof window !== "undefined") {
        window.removeEventListener("wallpaper-changed", handleWallpaperChange as EventListener);
        window.removeEventListener("wallpaper-refresh", handleWallpaperRefresh as EventListener);
    }
});

function onImageLoad() {
    isVisible = true;
}
</script>

{#if wallpaperEnabled && imageUrl}
<div 
    class="fixed inset-0 w-full h-full z-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
    class:opacity-100={isVisible}
    class:opacity-0={!isVisible}
>
    <img 
        src={imageUrl} 
        alt="" 
        class="w-full h-full object-cover"
        on:load={onImageLoad}
    />
    <!-- Add an overlay to adapt to light/dark themes -->
    <div class="absolute inset-0 bg-white/70 dark:bg-black/70 transition-colors duration-500"></div>
</div>
{/if}
