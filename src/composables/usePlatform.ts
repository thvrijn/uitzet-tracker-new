import { ref } from 'vue';

export type Platform = 'ipad' | 'phone';

// Same breakpoints as the mixins in assets/_platform.scss
const phoneScreen = window.matchMedia('screen and (max-width: 699px)');
const detect = (): Platform => phoneScreen.matches ? 'phone' : 'ipad';

export const platform = ref<Platform>(detect());

phoneScreen.addEventListener('change', () => { platform.value = detect(); });
