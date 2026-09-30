<script setup lang="ts">
import { statusOf, categoryIcon, formatPrice, type Item } from '../../composables/useItems';

defineProps<{ item: Item }>();
defineEmits<{ click: [] }>();
</script>

<template>
    <button class="item-card" @click="$emit('click')">
        <div class="item-card__image">
            <img v-if="item.image" :src="item.image" :alt="item.name" class="item-card__img" loading="lazy" />
            <component v-else :is="categoryIcon(item.category)" :size="40" :stroke-width="1.25" class="item-card__placeholder" />

            <span :class="['item-card__badge', 'glass', `status--${item.status}`]">
                <component :is="statusOf(item.status).Icon" :size="13" :stroke-width="2.5" />
                {{ statusOf(item.status).label }}
            </span>
        </div>

        <div class="item-card__body">
            <span class="item-card__name">{{ item.name }}</span>
            <span class="item-card__category">
                {{ item.category }}<template v-if="item.amount > 1"> · {{ item.amount }}×</template>
            </span>
            <span class="item-card__price">{{ formatPrice(item.price * item.amount) }}</span>
        </div>
    </button>
</template>

<style lang="scss" scoped>
@use '../../assets/platform' as *;

.item-card {
    display: flex;
    flex-direction: column;
    border-radius: 26px;
    background: var(--background-elevated);
    overflow: hidden;
    text-align: left;
    transition: transform 0.35s var(--ease-spring), box-shadow 0.3s;

    &:hover { box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08); }

    &:active { transform: scale(0.96); }

    &__image {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: 1;
        margin: 6px 6px 0;
        border-radius: 21px;
        background: var(--fill);
        overflow: hidden;
    }

    &__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    &__placeholder { color: var(--label-tertiary); }

    &__badge {
        position: absolute;
        top: 8px;
        left: 8px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 10px 5px 8px;
        border-radius: 100px;
        font-size: 12px;
        font-weight: 600;
        color: var(--status-color);
    }

    &__body {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 12px 16px 16px;
    }

    &__name {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        font-size: 16px;
        font-weight: 600;
        line-height: 1.25;
    }

    &__category {
        font-size: 13px;
        color: var(--label-secondary);
    }

    &__price {
        margin-top: 6px;
        font-family: var(--font-rounded);
        font-size: 17px;
        font-weight: 700;
    }
}

.item-card {
    @include mac {
        border-radius: 14px;

        &:active { transform: scale(0.98); }

        .item-card__image {
            margin: 4px 4px 0;
            border-radius: 10px;
        }

        .item-card__badge {
            top: 6px;
            left: 6px;
            padding: 3px 8px 3px 6px;
            font-size: 10px;
        }

        .item-card__body { padding: 8px 10px 10px; }

        .item-card__name { font-size: 13px; }

        .item-card__category { font-size: 11px; }

        .item-card__price {
            margin-top: 4px;
            font-size: 13px;
        }
    }
}
</style>
