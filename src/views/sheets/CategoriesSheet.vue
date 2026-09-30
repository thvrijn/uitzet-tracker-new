<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Check, Minus, Plus } from 'lucide-vue-next';
import { useItems, categoryIcon } from '../../composables/useItems';
import SheetModal from '../../components/UI/SheetModal.vue';

const router = useRouter();
const { items, categories, addCategory, saveCategory, deleteCategory } = useItems();

const newCategoryName = ref('');

const categoryCount = (category: string) => items.value.filter(item => item.category === category).length;

const handleRename = async (index: number, event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!(await saveCategory(index, input.value))) input.value = categories.value[index];
};

const handleDelete = (index: number) => {
    const category = categories.value[index];
    const count = categoryCount(category);
    if (count && !confirm(`“${category}” bevat ${count} items. Toch verwijderen?`)) return;
    deleteCategory(index);
};

const handleAdd = async () => {
    if (await addCategory(newCategoryName.value)) newCategoryName.value = '';
};
</script>

<template>
    <SheetModal title="Categorieën" @close="router.push('/')">
        <template #trailing>
            <button class="glass-button glass-button--round glass-button--prominent sheet-button" @click="router.push('/')">
                <Check :size="22" :stroke-width="2.5" class="sheet-button__icon" />
                <span class="sheet-button__label">Gereed</span>
            </button>
        </template>

        <div class="grouped-list">
            <div v-for="(category, index) in categories" :key="category" class="grouped-list__row categories__row">
                <button class="categories__remove" :aria-label="`Verwijder ${category}`" @click="handleDelete(index)">
                    <Minus :size="14" :stroke-width="3" />
                </button>
                <component :is="categoryIcon(category)" :size="20" :stroke-width="1.75" class="categories__icon" />
                <input
                    class="grouped-list__input"
                    :value="category"
                    enterkeyhint="done"
                    @change="handleRename(index, $event)"
                    @keydown.enter="($event.target as HTMLInputElement).blur()"
                />
                <span class="grouped-list__value">{{ categoryCount(category) }}</span>
            </div>
        </div>

        <div class="grouped-list">
            <form class="grouped-list__row categories__row" @submit.prevent="handleAdd">
                <button type="submit" class="categories__add" aria-label="Voeg toe" :disabled="!newCategoryName.trim()">
                    <Plus :size="14" :stroke-width="3" />
                </button>
                <input v-model="newCategoryName" class="grouped-list__input" placeholder="Nieuwe categorie" enterkeyhint="done" />
            </form>
        </div>
        <p class="categories__footer">Tik op een naam om die te wijzigen.</p>
    </SheetModal>
</template>

<style lang="scss" scoped>
@use '../../assets/platform' as *;

.categories {
    &__row::before { left: 56px !important; }

    &__remove,
    &__add {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--red);
        color: #ffffff;
        transition: transform 0.3s var(--ease-spring);

        &:active { transform: scale(0.85); }
    }

    &__add {
        background: var(--green);

        &:disabled { opacity: 0.4; }
    }

    &__icon {
        flex-shrink: 0;
        color: var(--tint);
    }

    &__footer {
        margin: -20px 20px 20px;
        font-size: 13px;
        color: var(--label-secondary);
    }
}

.categories {
    @include mac {
        &__row::before { left: 44px !important; }

        &__remove,
        &__add {
            width: 16px;
            height: 16px;

            svg {
                width: 10px;
                height: 10px;
            }
        }

        &__icon {
            width: 16px;
            height: 16px;
        }

        &__footer {
            margin: -8px 12px 12px;
            font-size: 11px;
        }
    }
}
</style>
