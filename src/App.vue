<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeft, LayoutGrid, List, PanelLeft, Plus, Search, X } from 'lucide-vue-next';
import AppSidebar from './components/Layout/AppSidebar.vue';
import ItemCard from './components/Items/ItemCard.vue';
import ItemRow from './components/Items/ItemRow.vue';
import { useItems, statusOf, formatPrice } from './composables/useItems';
import { platform } from './composables/usePlatform';

const router = useRouter();
const { items, activeCategory, activeStatus, loading, fetchItems } = useItems();

const isWide = () => window.matchMedia('(min-width: 900px)').matches;

const search = ref('');
const searchInput = ref<HTMLInputElement | null>(null);
const view = ref<'grid' | 'list'>((localStorage.getItem('view') as 'grid' | 'list') || 'grid');

// On iPhone the sidebar is the navigation root, so it starts visible there
const sidebarVisible = ref(platform.value === 'phone' || isWide());

const setView = (newView: 'grid' | 'list') => {
    view.value = newView;
    localStorage.setItem('view', newView);
};
//test
// When the sidebar covers the content (iPhone, or a narrow iPad/Mac window), picking a filter reveals the list
const closeSidebarIfOverlay = () => {
    if (platform.value === 'phone' || !isWide()) sidebarVisible.value = false;
};

const filtered = computed(() => {
    const query = search.value.toLowerCase();
    return items.value
        .filter(item => activeCategory.value === 'Alle' || item.category === activeCategory.value)
        .filter(item => activeStatus.value === 'Alle' || item.status === activeStatus.value)
        .filter(item => item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query));
});

const title = computed(() => [
    activeCategory.value !== 'Alle' ? activeCategory.value : '',
    activeStatus.value !== 'Alle' ? statusOf(activeStatus.value).label : '',
].filter(Boolean).join(' · ') || 'Alle items');

// Same rule as before: wishlist items don't count towards the total
const totalPrice = computed(() =>
    filtered.value.filter(item => item.status !== 'gewenst').reduce((sum, item) => sum + item.price * item.amount, 0));

const itemCountLabel = computed(() => `${filtered.value.length} ${filtered.value.length === 1 ? 'item' : 'items'}`);

const focusSearchOnCommandF = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
        event.preventDefault();
        searchInput.value?.focus();
    }
};

// The small toolbar title takes over once the large title has scrolled away
const largeTitleHidden = ref(false);
const handleScroll = (event: Event) => {
    largeTitleHidden.value = (event.target as HTMLElement).scrollTop > 40;
};

onMounted(() => {
    fetchItems();
    window.addEventListener('keydown', focusSearchOnCommandF);
});

onUnmounted(() => window.removeEventListener('keydown', focusSearchOnCommandF));
</script>

<template>
    <div :class="['app', { 'app--sidebar-visible': sidebarVisible }]">
        <aside class="app__sidebar">
            <AppSidebar @select="closeSidebarIfOverlay" />
        </aside>
        <div class="app__scrim" @click="sidebarVisible = false" />

        <main class="content" @scroll.passive="handleScroll">
            <header :class="['toolbar', { 'toolbar--scrolled': largeTitleHidden }]">
                <button
                    class="glass-button glass-button--round"
                    :aria-label="platform === 'phone' ? 'Terug' : 'Zijbalk'"
                    @click="sidebarVisible = !sidebarVisible"
                >
                    <ChevronLeft v-if="platform === 'phone'" :size="26" :stroke-width="2.25" />
                    <PanelLeft v-else :size="platform === 'mac' ? 16 : 20" :stroke-width="2" />
                </button>

                <div class="toolbar__heading">
                    <span class="toolbar__title">{{ title }}</span>
                    <span class="toolbar__subtitle">{{ itemCountLabel }} · {{ formatPrice(totalPrice, 0) }} uitgegeven</span>
                </div>

                <div class="glass-group">
                    <button
                        :class="['glass-group__button', { 'glass-group__button--active': view === 'grid' }]"
                        aria-label="Raster"
                        @click="setView('grid')"
                    >
                        <LayoutGrid :size="19" :stroke-width="2" />
                    </button>
                    <button
                        :class="['glass-group__button', { 'glass-group__button--active': view === 'list' }]"
                        aria-label="Lijst"
                        @click="setView('list')"
                    >
                        <List :size="19" :stroke-width="2" />
                    </button>
                </div>

                <!-- Toolbar on Mac/iPad; floating bottom bar on iPhone (iOS 26) -->
                <div class="toolbar__actions">
                    <label class="search-field glass">
                        <Search :size="16" :stroke-width="2" class="search-field__icon" />
                        <input
                            ref="searchInput"
                            v-model="search"
                            class="search-field__input"
                            type="search"
                            placeholder="Zoek"
                            enterkeyhint="search"
                        />
                        <button v-if="search" class="search-field__clear" aria-label="Wis" @click="search = ''">
                            <X :size="10" :stroke-width="3" />
                        </button>
                    </label>
                    <button class="glass-button glass-button--round glass-button--prominent" aria-label="Item toevoegen" @click="router.push('/item/add')">
                        <Plus :size="platform === 'mac' ? 18 : 22" :stroke-width="2.25" />
                    </button>
                </div>
            </header>

            <div class="content__inner">
                <h1 class="content__large-title">{{ title }}</h1>
                <p class="content__subtitle">
                    {{ itemCountLabel }} · <strong>{{ formatPrice(totalPrice, 0) }}</strong> uitgegeven
                </p>

                <div v-if="loading" class="empty-state">
                    <div class="spinner" />
                </div>

                <div v-else-if="filtered.length === 0" class="empty-state">
                    <Search :size="44" :stroke-width="1.5" class="empty-state__icon" />
                    <h2 class="empty-state__heading">Geen items</h2>
                    <p class="empty-state__sub">Pas je filters aan of voeg een item toe.</p>
                </div>

                <div v-else-if="view === 'grid'" class="grid-view">
                    <ItemCard v-for="item in filtered" :key="item.id" :item="item" @click="router.push(`/item/${item.id}`)" />
                </div>

                <div v-else class="grouped-list">
                    <ItemRow v-for="item in filtered" :key="item.id" :item="item" @click="router.push(`/item/${item.id}`)" />
                </div>
            </div>
        </main>

        <router-view v-slot="{ Component }">
            <Transition name="modal">
                <component :is="Component" />
            </Transition>
        </router-view>
    </div>
</template>

<style lang="scss">
@use './assets/platform' as *;

$sidebar-width: 340px;
$sidebar-width-mac: 250px;
$wide: 900px;

.app {
    display: flex;
    height: 100dvh;
    overflow: hidden;

    &__sidebar {
        flex-shrink: 0;
        width: $sidebar-width;
        margin-left: -$sidebar-width;
        padding: calc(env(safe-area-inset-top) + 10px) 0 calc(env(safe-area-inset-bottom) + 10px) 10px;
        transition: margin-left 0.5s var(--ease-spring);
    }

    &__scrim { display: none; }

    &--sidebar-visible &__sidebar { margin-left: 0; }

    // Narrow iPad / Mac window: sidebar slides over the content
    @media (max-width: ($wide - 1)) {
        &__sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 60;
            width: min(#{$sidebar-width}, calc(100vw - 40px));
            margin-left: 0;
            transform: translateX(-105%);
            transition: transform 0.5s var(--ease-spring);
        }

        &--sidebar-visible &__sidebar { transform: none; }

        &__scrim {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 55;
            background: var(--scrim);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s;
        }

        &--sidebar-visible &__scrim {
            opacity: 1;
            pointer-events: auto;
        }
    }

    @include mac {
        .app__sidebar {
            width: $sidebar-width-mac;
            margin-left: -$sidebar-width-mac;
            padding: 8px 0 8px 8px;
        }

        &.app--sidebar-visible .app__sidebar { margin-left: 0; }
    }

    // iOS: navigation stack. The sidebar is the root screen, the item list is pushed on top.
    @include phone {
        .app__sidebar {
            position: fixed;
            inset: 0;
            z-index: 1;
            width: auto;
            margin: 0;
            padding: 0;
            transform: translateX(-30%);
            transition: transform 0.5s var(--ease-spring);
        }

        &.app--sidebar-visible .app__sidebar { transform: none; }

        .app__scrim { display: none; }

        .content {
            position: fixed;
            inset: 0;
            z-index: 2;
            background: var(--background);
            box-shadow: -8px 0 30px rgba(0, 0, 0, 0.12);
            transition: transform 0.5s var(--ease-spring);
        }

        &.app--sidebar-visible .content { transform: translateX(105%); }
    }
}

.content {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    &__inner {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px calc(env(safe-area-inset-bottom) + 40px);
    }

    &__large-title {
        margin: 4px 0 2px;
        font-size: 34px;
        font-weight: 700;
        letter-spacing: -0.025em;
    }

    &__subtitle {
        margin: 0 0 20px;
        font-size: 15px;
        color: var(--label-secondary);

        strong {
            color: var(--label);
            font-weight: 600;
        }
    }

    @include phone {
        .content__inner { padding: 0 16px calc(env(safe-area-inset-bottom) + 96px); }
    }

    // macOS shows the title in the toolbar instead
    @include mac {
        .content__inner { padding: 8px 20px 24px; }

        .content__large-title,
        .content__subtitle { display: none; }
    }
}

.toolbar {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: calc(env(safe-area-inset-top) + 12px) 20px 12px;

    // iOS 26 scroll edge effect: content blurs out beneath the toolbar
    &::before {
        content: '';
        position: absolute;
        inset: 0 0 -24px;
        z-index: -1;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        background: linear-gradient(to bottom, var(--background) 10%, transparent);
        mask-image: linear-gradient(to bottom, #000 50%, transparent);
        -webkit-mask-image: linear-gradient(to bottom, #000 50%, transparent);
        opacity: 0;
        transition: opacity 0.3s;
    }

    &--scrolled::before { opacity: 1; }

    &__heading {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 0;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 0.25s, transform 0.35s var(--ease-spring);
    }

    &--scrolled &__heading {
        opacity: 1;
        transform: none;
    }

    &__title {
        max-width: 100%;
        font-size: 17px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__subtitle { display: none; }

    &__actions {
        display: flex;
        gap: 10px;
    }

    @include phone {
        padding: calc(env(safe-area-inset-top) + 8px) 16px 8px;

        .toolbar__actions {
            position: fixed;
            left: 16px;
            right: 16px;
            bottom: calc(env(safe-area-inset-bottom) + 10px);
            z-index: 30;

            .search-field {
                flex: 1;
                width: auto;
                height: 48px;
                border-radius: 24px;
            }

            .glass-button {
                width: 48px;
                height: 48px;
                border-radius: 24px;
            }
        }
    }

    // macOS: unified toolbar with title + subtitle on the left
    @include mac {
        gap: 8px;
        padding: 10px 12px;

        .toolbar__heading {
            align-items: flex-start;
            padding-left: 6px;
            opacity: 1;
            transform: none;
        }

        .toolbar__title {
            font-size: 15px;
            font-weight: 700;
            letter-spacing: -0.01em;
        }

        .toolbar__subtitle {
            display: block;
            font-size: 11px;
            color: var(--label-secondary);
        }

        .toolbar__actions { gap: 8px; }
    }
}

.search-field {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 240px;
    height: 44px;
    padding: 0 14px;
    border-radius: 22px;
    color: var(--label-secondary);
    cursor: text;

    &__icon { flex-shrink: 0; }

    &__input {
        flex: 1;
        min-width: 0;
        border: none;
        background: transparent;
        outline: none;
        font-size: 17px;
        color: var(--label);

        &::placeholder { color: var(--label-secondary); }

        &::-webkit-search-cancel-button { display: none; }
    }

    &__clear {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--label-tertiary);
        color: var(--background);
    }

    @include ipad {
        @media (max-width: 1000px) { width: 180px; }
    }

    @include mac {
        width: 190px;
        height: 32px;
        padding: 0 10px;
        border-radius: 16px;

        .search-field__icon {
            width: 14px;
            height: 14px;
        }

        .search-field__input { font-size: 13px; }
    }
}

.grid-view {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 16px;

    @include phone {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    @include mac {
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 14px;
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80px 0;
    text-align: center;

    &__icon { color: var(--label-tertiary); }

    &__heading {
        margin: 16px 0 4px;
        font-size: 22px;
        font-weight: 700;
    }

    &__sub {
        margin: 0;
        color: var(--label-secondary);
    }

    @include mac {
        .empty-state__heading { font-size: 17px; }
    }
}

.spinner {
    width: 28px;
    height: 28px;
    border: 3px solid var(--fill-strong);
    border-top-color: var(--label-secondary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
