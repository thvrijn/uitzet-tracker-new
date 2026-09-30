<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ExternalLink, X } from 'lucide-vue-next';
import { useItems, statusOf, categoryIcon, formatPrice } from '../../composables/useItems';
import SheetModal from '../../components/UI/SheetModal.vue';

const route = useRoute();
const router = useRouter();
const { items } = useItems();

const item = computed(() => items.value.find(existing => existing.id === route.params.id));

const details = computed(() => item.value && [
    { label: 'Prijs per stuk', value: formatPrice(item.value.price) },
    { label: 'Aantal', value: item.value.amount },
    { label: 'Besteldatum', value: item.value.order_date ? new Date(item.value.order_date).toLocaleDateString('nl-NL', { dateStyle: 'long' }) : '—' },
    { label: 'Categorie', value: item.value.category },
]);

const close = () => router.push('/');
</script>

<template>
    <SheetModal v-if="item" :title="item.category" @close="close">
        <template #leading>
            <button class="glass-button glass-button--round sheet-button" @click="close">
                <X :size="20" :stroke-width="2.25" class="sheet-button__icon" />
                <span class="sheet-button__label">Sluit</span>
            </button>
        </template>
        <template #trailing>
            <button class="glass-button sheet-button" @click="router.push(`/item/${item.id}/edit`)">Wijzig</button>
        </template>

        <div class="item-detail__hero">
            <img v-if="item.image" :src="item.image" :alt="item.name" class="item-detail__img" />
            <component v-else :is="categoryIcon(item.category)" :size="64" :stroke-width="1" class="item-detail__placeholder" />
        </div>

        <div class="item-detail__heading">
            <span :class="['item-detail__status', `status--${item.status}`]">
                <component :is="statusOf(item.status).Icon" :size="14" :stroke-width="2.5" />
                {{ statusOf(item.status).label }}
            </span>
            <h1 class="item-detail__name">{{ item.name }}</h1>
            <span class="item-detail__price">{{ formatPrice(item.price * item.amount) }}</span>
        </div>

        <div class="grouped-list">
            <div v-for="detail in details" :key="detail.label" class="grouped-list__row">
                <span class="grouped-list__label">{{ detail.label }}</span>
                <span class="grouped-list__value">{{ detail.value }}</span>
            </div>
        </div>

        <div class="grouped-list">
            <a
                v-if="item.url"
                :href="item.url"
                target="_blank"
                rel="noreferrer"
                class="grouped-list__row grouped-list__row--button grouped-list__row--tint item-detail__link"
            >
                <span class="grouped-list__label">Bekijk in webshop</span>
                <ExternalLink :size="18" :stroke-width="2" />
            </a>
            <button class="grouped-list__row grouped-list__row--button grouped-list__row--destructive" @click="router.push(`/item/${item.id}/delete`)">
                Verwijder item
            </button>
        </div>
    </SheetModal>
</template>

<style lang="scss" scoped>
@use '../../assets/platform' as *;

.item-detail {
    &__hero {
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: 4 / 3;
        border-radius: 30px;
        background: var(--fill);
        overflow: hidden;
    }

    &__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    &__placeholder { color: var(--label-tertiary); }

    &__heading {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        padding: 20px 4px 24px;
    }

    &__status {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 11px 5px 9px;
        border-radius: 100px;
        font-size: 13px;
        font-weight: 600;
        color: var(--status-color);
        background: color-mix(in srgb, var(--status-color) 14%, transparent);
    }

    &__name {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.02em;
        line-height: 1.15;
    }

    &__price {
        font-family: var(--font-rounded);
        font-size: 22px;
        font-weight: 600;
        color: var(--label-secondary);
    }

    &__link { text-decoration: none; }
}

.item-detail {
    @include mac {
        &__hero {
            aspect-ratio: 16 / 10;
            border-radius: 14px;
        }

        &__heading {
            gap: 4px;
            padding: 14px 2px 16px;
        }

        &__status {
            padding: 3px 8px 3px 6px;
            font-size: 11px;
        }

        &__name { font-size: 20px; }

        &__price { font-size: 15px; }
    }
}
</style>
