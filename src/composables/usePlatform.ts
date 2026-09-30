import { ref, watchEffect } from 'vue';

export type Platform = 'mac' | 'ipad' | 'phone';

const PLATFORMS: Platform[] = ['mac', 'ipad', 'phone'];

// Mouse/trackpad → macOS look; touch → iPadOS or iOS depending on width
const coarsePointer = window.matchMedia('(pointer: coarse)');
const narrowScreen = window.matchMedia('(max-width: 699px)');

// `?platform=mac|ipad|phone` forces a look, handy for previewing on one device
const requested = new URLSearchParams(window.location.search).get('platform') as Platform | null;
const forced = requested && PLATFORMS.includes(requested) ? requested : null;

const detect = (): Platform => forced ?? (!coarsePointer.matches ? 'mac' : narrowScreen.matches ? 'phone' : 'ipad');

export const platform = ref<Platform>(detect());

[coarsePointer, narrowScreen].forEach(query => query.addEventListener('change', () => { platform.value = detect(); }));

// Styles switch on `html[data-platform]`, see assets/_platform.scss
watchEffect(() => { document.documentElement.dataset.platform = platform.value; });
