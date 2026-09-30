<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronRight, Inbox, LayoutGrid, Plus } from 'lucide-vue-next';
import { useItems, STATUSES, categoryIcon } from '../../composables/useItems';
import { platform } from '../../composables/usePlatform';

const emit = defineEmits<{ select: [] }>();

const router = useRouter();
const { items, categories, activeCategory, activeStatus } = useItems();

const statusTiles = computed(() => [
    { key: 'Alle', label: 'Alle', Icon: Inbox },
    ...STATUSES,
].map(status => ({
    ...status,
    count: status.key === 'Alle' ? items.value.length : items.value.filter(item => item.status === status.key).length,
})));

const categoryCount = (category: string) => items.value.filter(item => item.category === category).length;

// On iPhone this is a navigation root without visible selection,
// so a tap opens exactly that list (like Reminders) instead of stacking filters
const selectStatus = (key: string) => {
    activeStatus.value = key;
    if (platform.value === 'phone') activeCategory.value = 'Alle';
    emit('select');
};

const selectCategory = (category: string) => {
    activeCategory.value = category;
    if (platform.value === 'phone') activeStatus.value = 'Alle';
    emit('select');
};
</script>

<template>
    <nav class="sidebar glass">
        <button class="sidebar__add glass-button glass-button--round glass-button--prominent" aria-label="Item toevoegen" @click="router.push('/item/add')">
            <Plus :size="22" :stroke-width="2.25" />
        </button>

        <h1 class="sidebar__title">Uitzet</h1>

        <div class="sidebar__tiles">
            <button
                v-for="tile in statusTiles"
                :key="tile.key"
                :class="['status-tile', `status--${tile.key}`, { 'status-tile--active': activeStatus === tile.key }]"
                @click="selectStatus(tile.key)"
            >
                <span class="status-tile__icon">
                    <component :is="tile.Icon" :size="17" :stroke-width="2.25" />
                </span>
                <span class="status-tile__count">{{ tile.count }}</span>
                <span class="status-tile__label">{{ tile.label }}</span>
            </button>
        </div>

        <div class="sidebar__section-header">
            <span>Categorieën</span>
            <button class="sidebar__edit" @click="router.push('/categories')">Wijzig</button>
        </div>

        <div class="sidebar__list">
            <button
                v-for="category in ['Alle', ...categories]"
                :key="category"
                :class="['sidebar-row', { 'sidebar-row--active': activeCategory === category }]"
                @click="selectCategory(category)"
            >
                <component
                    :is="category === 'Alle' ? LayoutGrid : categoryIcon(category)"
                    :size="20"
                    :stroke-width="1.75"
                    class="sidebar-row__icon"
                />
                <span class="sidebar-row__label">{{ category === 'Alle' ? 'Alle categorieën' : category }}</span>
                <span class="sidebar-row__count">
                    {{ category === 'Alle' ? items.length : categoryCount(category) }}
                </span>
                <ChevronRight :size="18" :stroke-width="2" class="sidebar-row__chevron" />
            </button>
        </div>
    </nav>
</template>

<style lang="scss" scoped>
@use '../../assets/platform' as *;

.sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px 14px;
    border-radius: 30px;
    overflow-y: auto;

    &__title {
        margin: 4px 8px 16px;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.02em;
    }

    &__tiles {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 26px;
    }

    &__section-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: 0 10px 8px;
        font-size: 20px;
        font-weight: 700;
    }

    &__edit {
        font-size: 15px;
        font-weight: 500;
        color: var(--tint);
    }

    &__list {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    &__add { display: none; }

    // iOS: full-screen navigation root, like the Reminders home screen
    @include phone {
        padding: calc(env(safe-area-inset-top) + 20px) 16px calc(env(safe-area-inset-bottom) + 16px);
        border: none;
        border-radius: 0;
        background: var(--background);
        box-shadow: none;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;

        .sidebar__title {
            margin: 4px 4px 16px;
            font-size: 34px;
            letter-spacing: -0.025em;
        }

        .sidebar__section-header { padding: 0 4px 8px; }

        .sidebar__list {
            gap: 0;
            border-radius: 26px;
            background: var(--background-elevated);
            overflow: hidden;
        }

        // Top right, like the + in the Reminders nav bar
        .sidebar__add {
            display: inline-flex;
            flex-shrink: 0;
            align-self: flex-end;
        }
    }

    // macOS: compact source list, no large title
    @include mac {
        padding: 12px 10px;
        border-radius: 18px;

        .sidebar__title { display: none; }

        .sidebar__tiles {
            gap: 8px;
            margin-bottom: 18px;
        }

        .sidebar__section-header {
            padding: 0 8px 4px;
            font-size: 11px;
            font-weight: 600;
            color: var(--label-secondary);
        }

        .sidebar__edit { font-size: 11px; }

        .sidebar__list { gap: 1px; }
    }
}

.status-tile {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    row-gap: 8px;
    padding: 10px 12px 10px 10px;
    border-radius: 18px;
    background: var(--background-elevated);
    text-align: left;
    transition: transform 0.3s var(--ease-spring), background 0.2s;

    &:active { transform: scale(0.95); }

    &__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--status-color);
        color: #ffffff;
    }

    &__count {
        justify-self: end;
        font-family: var(--font-rounded);
        font-size: 26px;
        font-weight: 700;
    }

    &__label {
        grid-column: 1 / -1;
        font-size: 15px;
        font-weight: 600;
        color: var(--label-secondary);
    }

    &--active {
        background: var(--status-color);
        color: #ffffff;

        .status-tile__icon {
            background: #ffffff;
            color: var(--status-color);
        }

        .status-tile__label { color: rgba(255, 255, 255, 0.9); }
    }

    @include phone {
        padding: 12px 14px 12px 12px;
        border-radius: 22px;

        // Navigation root: no persistent selection
        &--active {
            background: var(--background-elevated);
            color: var(--label);

            .status-tile__icon {
                background: var(--status-color);
                color: #ffffff;
            }

            .status-tile__label { color: var(--label-secondary); }
        }
    }

    @include mac {
        row-gap: 4px;
        padding: 7px 9px 7px 7px;
        border-radius: 12px;

        &:active { transform: none; }

        .status-tile__icon {
            width: 22px;
            height: 22px;

            svg {
                width: 12px;
                height: 12px;
            }
        }

        .status-tile__count { font-size: 18px; }

        .status-tile__label { font-size: 12px; }
    }
}

.sidebar-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 44px;
    padding: 0 12px;
    border-radius: 14px;
    text-align: left;
    transition: background 0.2s;

    &:active { background: var(--fill); }

    &__icon {
        flex-shrink: 0;
        color: var(--tint);
    }

    &__label { flex: 1; }

    &__count {
        font-size: 15px;
        color: var(--label-secondary);
    }

    &__chevron {
        display: none;
        flex-shrink: 0;
        color: var(--label-tertiary);
    }

    &--active {
        background: var(--tint);
        color: #ffffff;

        &:active { background: var(--tint); }

        .sidebar-row__icon,
        .sidebar-row__count { color: #ffffff; }
    }

    @include phone {
        min-height: 52px;
        padding: 0 16px;
        border-radius: 0;

        & + .sidebar-row::before {
            content: '';
            position: absolute;
            top: 0;
            left: 48px;
            right: 0;
            border-top: 0.5px solid var(--separator);
        }

        .sidebar-row__count { font-size: 17px; }

        .sidebar-row__chevron { display: block; }

        &--active {
            background: none;
            color: var(--label);

            &:active { background: var(--fill); }

            .sidebar-row__icon { color: var(--tint); }

            .sidebar-row__count { color: var(--label-secondary); }
        }
    }

    // macOS: 28pt rows with a neutral selection
    @include mac {
        gap: 8px;
        min-height: 28px;
        padding: 0 8px;
        border-radius: 8px;

        &:active { background: none; }

        .sidebar-row__icon {
            width: 16px;
            height: 16px;
        }

        .sidebar-row__count { font-size: 12px; }

        &--active {
            background: var(--fill-strong);
            color: var(--label);

            &:active { background: var(--fill-strong); }

            .sidebar-row__icon { color: var(--tint); }

            .sidebar-row__count { color: var(--label-secondary); }
        }
    }
}
</style>
