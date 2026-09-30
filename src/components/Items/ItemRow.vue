<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';
import { statusOf, categoryIcon, formatPrice, type Item } from '../../composables/useItems';

defineProps<{ item: Item }>();
defineEmits<{ click: [] }>();
</script>

<template>
    <button class="grouped-list__row grouped-list__row--button item-row" @click="$emit('click')">
        <div class="item-row__thumb">
            <img v-if="item.image" :src="item.image" :alt="item.name" class="item-row__img" loading="lazy" />
            <component v-else :is="categoryIcon(item.category)" :size="22" :stroke-width="1.5" class="item-row__placeholder" />
        </div>

        <div class="item-row__text">
            <span class="item-row__name">{{ item.name }}</span>
            <span class="item-row__meta">
                <span :class="['item-row__status', `status--${item.status}`]">
                    <component :is="statusOf(item.status).Icon" :size="12" :stroke-width="2.5" />
                    {{ statusOf(item.status).label }}
                </span>
                · {{ item.category }}<template v-if="item.amount > 1"> · {{ item.amount }}×</template>
            </span>
        </div>

        <span class="item-row__price">{{ formatPrice(item.price * item.amount) }}</span>
        <ChevronRight :size="18" :stroke-width="2" class="item-row__chevron" />
    </button>
</template>

<style lang="scss" scoped>
@use '../../assets/platform' as *;

.item-row {
    // separator starts after the thumbnail, like iOS
    &::before { left: 80px !important; }

    &__thumb {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: var(--fill);
        overflow: hidden;
    }

    &__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    &__placeholder { color: var(--label-tertiary); }

    &__text {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        gap: 2px;
    }

    &__name {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-weight: 500;
    }

    &__meta {
        font-size: 13px;
        color: var(--label-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__status {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        vertical-align: -1px;
        font-weight: 600;
        color: var(--status-color);
    }

    &__price {
        font-family: var(--font-rounded);
        font-weight: 600;
        font-variant-numeric: tabular-nums;
    }

    &__chevron {
        flex-shrink: 0;
        color: var(--label-tertiary);
    }
}

.item-row {
    @include mac {
        min-height: 44px;

        &::before { left: 54px !important; }

        .item-row__thumb {
            width: 32px;
            height: 32px;
            border-radius: 7px;
        }

        .item-row__meta { font-size: 11px; }

        .item-row__chevron { display: none; }
    }
}
</style>
