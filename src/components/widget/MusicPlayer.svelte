<script lang="ts">
import { musicConfig } from "@/config";
import Icon from "@iconify/svelte";
import { onMount, tick } from "svelte";
import { slide, fly } from "svelte/transition";

let { ...props }: any = $props();

let isOpen = $state(false);
let isListOpen = $state(false);
let isPlaying = $state(false);
let volume = $state(musicConfig.volume || 0.5);
let currentTime = $state(0);
let duration = $state(0);
let currentIndex = $state(0);
// 播放模式：0 - 顺序播放，1 - 随机播放，2 - 单曲循环
let playMode = $state(0);
const playModes = [
    { icon: "material-symbols:repeat-rounded", label: "顺序播放" },
    { icon: "material-symbols:shuffle-rounded", label: "随机播放" },
    { icon: "material-symbols:repeat-one-rounded", label: "单曲循环" }
];
let errorCount = 0; // 用于防止全是无效链接导致无限循环
let audioElement = $state() as HTMLAudioElement;
let listElement = $state() as HTMLDivElement;

let currentMusic = $derived(musicConfig.list[currentIndex]);

// Initialize
onMount(() => {
    if (musicConfig.autoplay && musicConfig.enable && musicConfig.list.length > 0) {
        // Autoplay may be blocked by browsers until user interaction
        audioElement.play().catch(e => console.warn("Autoplay blocked:", e));
    }
});

function togglePanel() {
    isOpen = !isOpen;
    if (!isOpen) {
        isListOpen = false; // 关闭面板时同时收起播放列表
    }
}

function togglePlay() {
    if (isPlaying) {
        audioElement.pause();
    } else {
        audioElement.play();
    }
}

function handlePlay() {
    isPlaying = true;
    errorCount = 0; // 成功播放时重置错误计数
}

function handlePause() {
    isPlaying = false;
}

function togglePlayMode() {
    playMode = (playMode + 1) % 3;
}

function playNext(forcePlay = false, isEndedEvent = false) {
    if (isEndedEvent && playMode === 2) {
        // 单曲循环并且是自然结束时，重新播放当前歌曲
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.warn("play err:", e));
        return;
    }

    if (playMode === 1) {
        // 随机播放
        const nextIndex = Math.floor(Math.random() * musicConfig.list.length);
        currentIndex = nextIndex !== currentIndex ? nextIndex : (nextIndex + 1) % musicConfig.list.length; // 避免随机到同一首
    } else {
        // 顺序播放/单曲循环被主动点击下一首时
        currentIndex = (currentIndex + 1) % musicConfig.list.length;
    }

    setTimeout(() => {
        if (isPlaying || forcePlay) {
            audioElement.play().catch(e => console.warn("play err:", e));
        }
    }, 0);
}

function playPrev() {
    if (playMode === 1) {
        // 随机播放
        const nextIndex = Math.floor(Math.random() * musicConfig.list.length);
        currentIndex = nextIndex !== currentIndex ? nextIndex : (nextIndex + 1) % musicConfig.list.length;
    } else {
        currentIndex = (currentIndex - 1 + musicConfig.list.length) % musicConfig.list.length;
    }

    setTimeout(() => {
        if (isPlaying) {
            audioElement.play().catch(e => console.warn("play err:", e));
        }
    }, 0);
}

function handleEnded() {
    playNext(true, true);
}

function handleError() {
    if (errorCount >= musicConfig.list.length) {
        isPlaying = false;
        return; // 所有歌曲都无法播放，停止自动跳过
    }
    errorCount++;
    console.warn(`Failed to play: ${currentMusic.title}, skipping to next.`);
    playNext(isPlaying); // 如果之前是在播放状态报错的就继续播下一首，否则只静默切歌
}

function setTime(e: Event) {
    const target = e.target as HTMLInputElement;
    audioElement.currentTime = parseFloat(target.value);
}

function setVolume(e: Event) {
    const target = e.target as HTMLInputElement;
    volume = parseFloat(target.value);
    audioElement.volume = volume;
}

function playTrack(index: number) {
    currentIndex = index;
    // Audio will change src because of reactivity on `currentMusic.url`
    // Auto play when selecting a track
    setTimeout(() => {
        audioElement.play();
    }, 0);
}

function formatTime(seconds: number) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function scrollToCurrent() {
    if (!isListOpen) {
        isListOpen = true; // 点击定位按钮时如果列表未打开自动打开
    }
    await tick(); // 等待 DOM 更新挂载列表元素
    if (listElement) {
        const activeItem = listElement.children[currentIndex] as HTMLElement;
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}
</script>

{#if musicConfig.enable && musicConfig.list.length > 0}
<!-- Hidden audio tag -->
<audio 
    bind:this={audioElement}
    src={currentMusic.url}
    onplay={handlePlay}
    onpause={handlePause}
    onended={handleEnded}
    onerror={handleError}
    ontimeupdate={() => currentTime = audioElement.currentTime}
    ondurationchange={() => duration = audioElement.duration}
    volume={volume}
></audio>

<!-- Global positioning -->
<div class="fixed bottom-6 left-6 z-[100] font-sans flex items-end">
    
    <!-- Floating toggle button -->
    <button 
        class="relative w-12 h-12 flex items-center justify-center rounded-full bg-[var(--card-bg)] shadow-lg transition-transform hover:scale-105 active:scale-95 border-2 border-[var(--primary)] aspect-square overflow-hidden" 
        onclick={togglePanel}
        aria-label="Toggle Music Player"
    >
        {#if currentMusic.cover}
            <img 
                src={currentMusic.cover} 
                alt="cover" 
                class="absolute inset-0 w-full h-full object-cover rounded-full opacity-60 {isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}" 
            />
        {/if}
        <Icon icon="material-symbols:music-note-rounded" class="text-2xl z-10 text-[var(--primary)] drop-shadow-md" />
        {#if isPlaying && !isOpen}
            <span class="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--card-bg)]"></span>
        {/if}
    </button>

    <!-- Panels Container -->
    <div class="absolute bottom-16 left-0 w-80 flex flex-col-reverse gap-3 pointer-events-none z-10">
        <!-- Main Player Panel -->
        {#if isOpen}
            <div transition:fly={{ y: 20, duration: 300 }} class="card-base p-4 shadow-xl flex flex-col gap-4 pointer-events-auto">
                <!-- Header (Cover & Info) -->
                <div class="flex items-center gap-3">
                    <div class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-black/10 dark:bg-white/10 flex items-center justify-center">
                        {#if currentMusic.cover}
                            <img src={currentMusic.cover} alt="cover" class="w-full h-full object-cover" />
                        {:else}
                            <Icon icon="material-symbols:music-note-rounded" class="text-2xl opacity-50" />
                        {/if}
                    </div>
                    <div class="flex-1 min-w-0 overflow-hidden">
                        <div class="text-sm font-bold truncate text-[var(--primary)]">{currentMusic.title}</div>
                        <div class="text-xs text-black/50 dark:text-white/50 truncate">{currentMusic.artist}</div>
                    </div>
                </div>

                <!-- Controls (Progress & Time) -->
                <div class="flex flex-col gap-1">
                    <div class="flex justify-between text-[10px] text-black/50 dark:text-white/50 px-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max={duration || 100} 
                        value={currentTime} 
                        oninput={setTime}
                        class="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full appearance-none outline-none cursor-pointer accent-[var(--primary)]"
                    />
                </div>

                <!-- Buttons -->
                <div class="flex items-center justify-between px-2 text-black dark:text-white">
                    <!-- Volume Control -->
                    <div class="flex items-center gap-1.5 w-20">
                        <Icon icon={volume === 0 ? "material-symbols:volume-off-rounded" : "material-symbols:volume-up-rounded"} class="text-lg opacity-70" />
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={volume} 
                            oninput={setVolume}
                            class="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full appearance-none outline-none cursor-pointer accent-[var(--primary)]"
                        />
                    </div>

                    <!-- Play Controls -->
                    <div class="flex items-center gap-1">
                        <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition" onclick={() => playPrev()}>
                            <Icon icon="material-symbols:skip-previous-rounded" class="text-xl" />
                        </button>
                        <button class="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-md transition hover:scale-105 active:scale-95" onclick={togglePlay}>
                            <Icon icon={isPlaying ? "material-symbols:pause-rounded" : "material-symbols:play-arrow-rounded"} class="text-2xl" />
                        </button>
                        <button class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition" onclick={() => playNext(true)}>
                            <Icon icon="material-symbols:skip-next-rounded" class="text-xl" />
                        </button>
                    </div>

                    
                    
                    <!-- Playlist Toggle -->
                    <div class="flex items-center justify-end gap-1">
                        <!-- Play Mode Toggle -->
                        <button 
                            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition opacity-70 hover:opacity-100" 
                            onclick={togglePlayMode}
                            title={playModes[playMode].label}
                            aria-label="Toggle Play Mode"
                        >
                            <Icon icon={playModes[playMode].icon} class="text-xl" />
                        </button>

                        <!-- Locate Current -->
                        <button 
                            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition opacity-70 hover:opacity-100" 
                            onclick={scrollToCurrent}
                            title="定位当前播放"
                            aria-label="Locate Current Track"
                        >
                            <Icon icon="material-symbols:my-location-rounded" class="text-xl" />
                        </button>

                        <button 
                            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition {isListOpen ? 'text-[var(--primary)]' : 'opacity-70'}" 
                            onclick={() => isListOpen = !isListOpen}
                            aria-label="Toggle Playlist"
                        >
                            <Icon icon="material-symbols:queue-music-rounded" class="text-xl" />
                        </button>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Playlist Independent Panel -->
        {#if isOpen && isListOpen}
            <div transition:slide={{ duration: 300, axis: 'y' }} class="pointer-events-auto">
                <div class="card-base shadow-xl p-2">
                    <div 
                        bind:this={listElement}
                        class="max-h-[280px] overflow-y-auto pr-1 scrollbar-base overscroll-contain"
                        onwheel={(e) => e.stopPropagation()}
                        ontouchmove={(e) => e.stopPropagation()}
                    >
                        {#each musicConfig.list as track, i}
                            <button 
                                class="w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition hover:bg-black/5 dark:hover:bg-white/5 {i === currentIndex ? 'bg-black/5 dark:bg-white/5' : ''}"
                                onclick={() => playTrack(i)}
                            >
                                <div class="w-4 flex-shrink-0 flex items-center justify-center">
                                    {#if i === currentIndex}
                                        {#if isPlaying}
                                            <Icon icon="material-symbols:equalizer-rounded" class="text-xs text-[var(--primary)] animate-pulse" />
                                        {:else}
                                            <Icon icon="material-symbols:play-arrow-rounded" class="text-xs text-[var(--primary)]" />
                                        {/if}
                                    {:else}
                                        <span class="text-[10px] text-black/30 dark:text-white/30">{i + 1}</span>
                                    {/if}
                                </div>
                                <span class="text-xs truncate flex-1 {i === currentIndex ? 'text-[var(--primary)] font-medium' : 'text-black/70 dark:text-white/70'}">{track.title}</span>
                                <span class="text-[10px] text-black/40 dark:text-white/40 truncate max-w-[60px]">{track.artist}</span>
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
{/if}

<style>
.scrollbar-base::-webkit-scrollbar {
    width: 4px;
}
.scrollbar-base::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5); /* Tailwind gray-400 with opacity */
    border-radius: 4px;
}
.scrollbar-base::-webkit-scrollbar-track {
    background: transparent;
}
</style>
