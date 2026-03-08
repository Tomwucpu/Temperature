<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import { 
    getDefaultHue, getHue, setHue, getGlassmorphism, setGlassmorphism, 
    getBgHueLight1, getBgHueLight2, getBgHueDark1, getBgHueDark2, 
    setBgHueLight1, setBgHueLight2, setBgHueDark1, setBgHueDark2 
} from "@utils/setting-utils";

let hue = getHue();
let bgHueLight1 = getBgHueLight1();
let bgHueLight2 = getBgHueLight2();
let bgHueDark1 = getBgHueDark1();
let bgHueDark2 = getBgHueDark2();
const defaultHue = getDefaultHue();

let isDark = false;
/* 毛玻璃风格开关状态 */
let glass = getGlassmorphism();

onMount(() => {
    isDark = document.documentElement.classList.contains('dark');
    const observer = new MutationObserver(() => {
        isDark = document.documentElement.classList.contains('dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
});

function resetHue() { hue = getDefaultHue(); }
function resetBgHueLight1() { bgHueLight1 = getDefaultHue(); }
function resetBgHueLight2() { bgHueLight2 = getDefaultHue(); }
function resetBgHueDark1() { bgHueDark1 = getDefaultHue(); }
function resetBgHueDark2() { bgHueDark2 = getDefaultHue(); }

function toggleGlass() {
	glass = !glass;
	setGlassmorphism(glass);
}

$: if (hue || hue === 0) setHue(hue);
$: if (bgHueLight1 || bgHueLight1 === 0) setBgHueLight1(bgHueLight1);
$: if (bgHueLight2 || bgHueLight2 === 0) setBgHueLight2(bgHueLight2);
$: if (bgHueDark1 || bgHueDark1 === 0) setBgHueDark1(bgHueDark1);
$: if (bgHueDark2 || bgHueDark2 === 0) setBgHueDark2(bgHueDark2);
</script>

<div id="display-setting" class="float-panel float-panel-closed absolute transition-all w-80 right-4 px-4 py-4">
    <div class="flex flex-row gap-2 mb-3 items-center justify-between">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            {i18n(I18nKey.themeColor)}
            <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md  active:scale-90 will-change-transform"
                    class:opacity-0={hue === defaultHue} class:pointer-events-none={hue === defaultHue} on:click={resetHue}>
                <div class="text-[var(--btn-content)]">
                    <Icon icon="fa6-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                </div>
            </button>
        </div>
        <div class="flex gap-1">
            <div id="hueValue" class="transition bg-[var(--btn-regular-bg)] w-10 h-7 rounded-md flex justify-center
            font-bold text-sm items-center text-[var(--btn-content)]">
                {hue}
            </div>
        </div>
    </div>
    <div class="w-full h-6 px-1 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none">
        <input aria-label={i18n(I18nKey.themeColor)} type="range" min="0" max="360" bind:value={hue}
               class="slider" id="colorSlider" step="5" style="width: 100%">
    </div>

    <!-- 毛玻璃风格开关 -->
    <div class="flex items-center justify-between mt-4 pt-3 border-t border-black/5 dark:border-white/10">
        <div class="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100 transition">
            <Icon icon="material-symbols:blur-on" class="text-[1.25rem] text-[var(--primary)]"></Icon>
            {i18n(I18nKey.glassmorphism)}
        </div>
        <button
            aria-label="Toggle Glassmorphism"
            class="relative w-11 h-6 rounded-full transition-colors duration-200 {glass ? 'bg-[var(--primary)]' : 'bg-black/15 dark:bg-white/15'}"
            on:click={toggleGlass}
        >
            <span
                class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 {glass ? 'translate-x-5' : 'translate-x-0'}"
            ></span>
        </button>
    </div>

    <!-- 过渡色滑块 (仅在玻璃模式时显示) -->
    {#if glass}
    <!-- 左渐变色 -->
    <div class="flex items-center justify-between mt-4 pt-3 border-t border-black/5 dark:border-white/10 transition-all">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            {i18n(I18nKey.bgGradientLeft)}
            <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md active:scale-90 will-change-transform"
                    class:opacity-0={isDark ? bgHueDark1 === defaultHue : bgHueLight1 === defaultHue} 
                    class:pointer-events-none={isDark ? bgHueDark1 === defaultHue : bgHueLight1 === defaultHue} 
                    on:click={isDark ? resetBgHueDark1 : resetBgHueLight1}>
                <div class="text-[var(--btn-content)]">
                    <Icon icon="fa6-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                </div>
            </button>
        </div>
        <div class="flex gap-1">
            <div id="bgHueLeftValue" class="transition bg-[var(--btn-regular-bg)] w-10 h-7 rounded-md flex justify-center
            font-bold text-sm items-center text-[var(--btn-content)]">
                {isDark ? bgHueDark1 : bgHueLight1}
            </div>
        </div>
    </div>
    <div class="w-full h-6 px-1 mt-3 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none mb-1">
        {#if isDark}
        <input aria-label={i18n(I18nKey.bgGradientLeft)} type="range" min="0" max="360" bind:value={bgHueDark1}
               class="slider" id="bgColorSliderDark1" step="5" style="width: 100%">
        {:else}
        <input aria-label={i18n(I18nKey.bgGradientLeft)} type="range" min="0" max="360" bind:value={bgHueLight1}
               class="slider" id="bgColorSliderLight1" step="5" style="width: 100%">
        {/if}
    </div>

    <!-- 右渐变色 -->
    <div class="flex items-center justify-between mt-4 pt-3 border-t border-black/5 dark:border-white/10 transition-all">
        <div class="flex gap-2 font-bold text-lg text-neutral-900 dark:text-neutral-100 transition relative ml-3
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:-left-3 before:top-[0.33rem]"
        >
            {i18n(I18nKey.bgGradientRight)}
            <button aria-label="Reset to Default" class="btn-regular w-7 h-7 rounded-md active:scale-90 will-change-transform"
                    class:opacity-0={isDark ? bgHueDark2 === defaultHue : bgHueLight2 === defaultHue} 
                    class:pointer-events-none={isDark ? bgHueDark2 === defaultHue : bgHueLight2 === defaultHue} 
                    on:click={isDark ? resetBgHueDark2 : resetBgHueLight2}>
                <div class="text-[var(--btn-content)]">
                    <Icon icon="fa6-solid:arrow-rotate-left" class="text-[0.875rem]"></Icon>
                </div>
            </button>
        </div>
        <div class="flex gap-1">
            <div id="bgHueRightValue" class="transition bg-[var(--btn-regular-bg)] w-10 h-7 rounded-md flex justify-center
            font-bold text-sm items-center text-[var(--btn-content)]">
                {isDark ? bgHueDark2 : bgHueLight2}
            </div>
        </div>
    </div>
    <div class="w-full h-6 px-1 mt-3 bg-[oklch(0.80_0.10_0)] dark:bg-[oklch(0.70_0.10_0)] rounded select-none mb-1">
        {#if isDark}
        <input aria-label={i18n(I18nKey.bgGradientRight)} type="range" min="0" max="360" bind:value={bgHueDark2}
               class="slider" id="bgColorSliderDark2" step="5" style="width: 100%">
        {:else}
        <input aria-label={i18n(I18nKey.bgGradientRight)} type="range" min="0" max="360" bind:value={bgHueLight2}
               class="slider" id="bgColorSliderLight2" step="5" style="width: 100%">
        {/if}
    </div>
    {/if}
</div>


<style lang="stylus">
    #display-setting
      input[type="range"]
        -webkit-appearance none
        height 1.5rem
        background-image var(--color-selection-bar)
        transition background-image 0.15s ease-in-out

        /* Input Thumb */
        &::-webkit-slider-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

        &::-moz-range-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          border-width 0
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

        &::-ms-thumb
          -webkit-appearance none
          height 1rem
          width 0.5rem
          border-radius 0.125rem
          background rgba(255, 255, 255, 0.7)
          box-shadow none
          &:hover
            background rgba(255, 255, 255, 0.8)
          &:active
            background rgba(255, 255, 255, 0.6)

</style>
