import { ref } from 'vue';

export type Platform = 'mac' | 'ipad' | 'phone';

// Same breakpoints as the mixins in assets/_platform.scss
const phoneScreen = window.matchMedia('screen and (max-width: 699px)');
const macScreen = window.matchMedia('screen and (min-width: 1200px)');

const detect = (): Platform => phoneScreen.matches ? 'phone' : macScreen.matches ? 'mac' : 'ipad';

export const platform = ref<Platform>(detect());

[phoneScreen, macScreen].forEach(query => query.addEventListener('change', () => { platform.value = detect(); }));
