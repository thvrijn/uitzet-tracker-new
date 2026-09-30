<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Check, ChevronsUpDown, ImagePlus, Minus, Plus, X } from 'lucide-vue-next';
import { useItems, STATUSES, EMPTY_FORM, type FormData } from '../../composables/useItems';
import SheetModal from '../../components/UI/SheetModal.vue';

const route = useRoute();
const router = useRouter();
const { items, categories, activeCategory, saveItem, uploadImage } = useItems();

const editId = computed(() => (route.params.id as string | undefined) ?? null);
const existingItem = computed(() => items.value.find(item => item.id === editId.value));

const form = ref<FormData>({
    ...EMPTY_FORM,
    category: activeCategory.value !== 'Alle' ? activeCategory.value : categories.value[0] || EMPTY_FORM.category,
});

// Fill once, as soon as the item is available (it may still be loading on a deep link)
let prefilled = false;
watch(existingItem, item => {
    if (!item || prefilled) return;
    prefilled = true;
    form.value = { ...item, order_date: item.order_date ?? '', price: String(item.price), amount: String(item.amount) };
}, { immediate: true });

const pendingImageFile = ref<File | null>(null);
const isSaving = ref(false);

// Deep links have no in-app history to go back to
const close = () => (window.history.state?.back ? router.back() : router.push('/'));

const changeAmount = (delta: number) => {
    form.value.amount = String(Math.max(1, (parseInt(form.value.amount) || 1) + delta));
};

const handleImageUpload = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    pendingImageFile.value = file;
    form.value.image = URL.createObjectURL(file);
};

const removeImage = () => {
    pendingImageFile.value = null;
    form.value.image = '';
};

const handleSave = async () => {
    isSaving.value = true;
    try {
        if (pendingImageFile.value) {
            form.value.image = await uploadImage(pendingImageFile.value);
            pendingImageFile.value = null;
        }
        if (await saveItem(form.value, editId.value)) close();
    } catch (error) {
        console.error('upload error:', error);
        alert('Opslaan mislukt. Probeer het opnieuw.');
    } finally {
        isSaving.value = false;
    }
};
</script>

<template>
    <SheetModal :title="editId ? 'Wijzig item' : 'Nieuw item'" @close="close">
        <template #leading>
            <button class="glass-button glass-button--round sheet-button" @click="close">
                <X :size="20" :stroke-width="2.25" class="sheet-button__icon" />
                <span class="sheet-button__label">Annuleer</span>
            </button>
        </template>
        <template #trailing>
            <button
                class="glass-button glass-button--round glass-button--prominent sheet-button"
                :disabled="!form.name.trim() || isSaving"
                @click="handleSave"
            >
                <span v-if="isSaving" class="item-form__spinner sheet-button__icon" />
                <Check v-else :size="22" :stroke-width="2.5" class="sheet-button__icon" />
                <span class="sheet-button__label">Bewaar</span>
            </button>
        </template>

        <div class="item-form__photo">
            <label class="item-form__photo-well">
                <input type="file" accept="image/*" class="item-form__file" @change="handleImageUpload" />
                <img v-if="form.image" :src="form.image" alt="" class="item-form__photo-img" />
                <ImagePlus v-else :size="36" :stroke-width="1.5" class="item-form__photo-icon" />
            </label>
            <button v-if="form.image" class="item-form__photo-action item-form__photo-action--destructive" @click="removeImage">
                Verwijder foto
            </button>
            <span v-else class="item-form__photo-action">Voeg foto toe</span>
        </div>

        <div class="segmented-control">
            <button
                v-for="status in STATUSES"
                :key="status.key"
                :class="['segmented-control__segment', `status--${status.key}`, { 'segmented-control__segment--active': form.status === status.key }]"
                @click="form.status = status.key"
            >
                <component :is="status.Icon" :size="15" :stroke-width="2.25" />
                {{ status.label }}
            </button>
        </div>

        <div class="grouped-list">
            <label class="grouped-list__row">
                <input v-model="form.name" class="grouped-list__input" placeholder="Naam" autocomplete="off" />
            </label>
            <label class="grouped-list__row">
                <span class="grouped-list__label">Categorie</span>
                <span class="item-form__select">
                    <select v-model="form.category" class="item-form__select-input">
                        <option v-for="category in categories" :key="category">{{ category }}</option>
                    </select>
                    <ChevronsUpDown :size="15" :stroke-width="2" />
                </span>
            </label>
        </div>

        <div class="grouped-list">
            <label class="grouped-list__row">
                <span class="grouped-list__label">Prijs per stuk</span>
                <span class="item-form__currency">€</span>
                <input
                    v-model="form.price"
                    class="grouped-list__input grouped-list__input--trailing item-form__price"
                    inputmode="decimal"
                    placeholder="0,00"
                />
            </label>
            <div class="grouped-list__row">
                <span class="grouped-list__label">Aantal</span>
                <span class="item-form__amount">{{ form.amount }}</span>
                <div class="stepper">
                    <button class="stepper__button" aria-label="Minder" :disabled="form.amount === '1'" @click="changeAmount(-1)">
                        <Minus :size="16" :stroke-width="2.5" />
                    </button>
                    <span class="stepper__divider" />
                    <button class="stepper__button" aria-label="Meer" @click="changeAmount(1)">
                        <Plus :size="16" :stroke-width="2.5" />
                    </button>
                </div>
            </div>
        </div>

        <div class="grouped-list">
            <label class="grouped-list__row">
                <span class="grouped-list__label">Besteldatum</span>
                <input v-model="form.order_date" type="date" class="grouped-list__input grouped-list__input--trailing item-form__date" />
            </label>
            <label class="grouped-list__row">
                <input v-model="form.url" class="grouped-list__input" type="url" inputmode="url" placeholder="Webshop-URL" autocomplete="off" />
            </label>
        </div>

        <div v-if="editId" class="grouped-list">
            <button class="grouped-list__row grouped-list__row--button grouped-list__row--destructive" @click="router.replace(`/item/${editId}/delete`)">
                Verwijder item
            </button>
        </div>
    </SheetModal>
</template>

<style lang="scss" scoped>
@use '../../assets/platform' as *;

.item-form {
    &__photo {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-bottom: 24px;
    }

    &__photo-well {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 140px;
        height: 140px;
        border-radius: 32px;
        background: var(--fill);
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s var(--ease-spring);

        &:active { transform: scale(0.95); }
    }

    &__file { display: none; }

    &__photo-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    &__photo-icon { color: var(--tint); }

    &__photo-action {
        font-size: 15px;
        font-weight: 500;
        color: var(--tint);

        &--destructive { color: var(--red); }
    }

    &__select {
        position: relative;
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--label-secondary);
    }

    &__select-input {
        appearance: none;
        -webkit-appearance: none;
        border: none;
        background: transparent;
        outline: none;
        font-size: 17px;
        color: var(--label-secondary);
        text-align: right;
        cursor: pointer;
    }

    &__currency { color: var(--label-secondary); }

    &__price {
        flex: 0 0 110px;
        font-variant-numeric: tabular-nums;
    }

    &__date {
        flex: 0 0 auto;
        min-height: 24px;
    }

    &__amount {
        min-width: 24px;
        text-align: right;
        color: var(--label-secondary);
        font-variant-numeric: tabular-nums;
    }

    &__spinner {
        width: 18px;
        height: 18px;
        border: 2.5px solid rgba(255, 255, 255, 0.4);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }
}

.stepper {
    display: flex;
    align-items: center;
    height: 32px;
    border-radius: 100px;
    background: var(--fill);

    &__button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 100%;
        border-radius: 100px;

        &:active { background: var(--fill-strong); }

        &:disabled { opacity: 0.3; }
    }

    &__divider {
        width: 0.5px;
        height: 18px;
        background: var(--separator);
    }
}

.item-form {
    @include mac {
        &__photo {
            gap: 6px;
            margin-bottom: 16px;
        }

        &__photo-well {
            width: 88px;
            height: 88px;
            border-radius: 20px;
        }

        &__photo-action { font-size: 12px; }

        &__select-input { font-size: 13px; }

        &__price { flex-basis: 90px; }

        &__spinner { display: none; }
    }
}

.stepper {
    @include mac {
        height: 22px;

        &__button { width: 28px; }
    }
}
</style>
