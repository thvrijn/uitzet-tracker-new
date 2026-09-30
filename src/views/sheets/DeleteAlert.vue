<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useItems } from '../../composables/useItems';

const route = useRoute();
const router = useRouter();
const { items, deleteItem } = useItems();

const item = computed(() => items.value.find(existing => existing.id === route.params.id));
const isDeleting = ref(false);

// Deep links have no in-app history to go back to
const cancel = () => (window.history.state?.back ? router.back() : router.push('/'));

const confirm = async () => {
    if (!item.value) return;
    isDeleting.value = true;
    await deleteItem(item.value.id);
    router.push('/');
};
</script>

<template>
    <div class="alert" @click.self="cancel">
        <div class="alert__panel modal-panel glass" role="alertdialog">
            <h2 class="alert__title">“{{ item?.name }}” verwijderen?</h2>
            <p class="alert__message">Dit kan niet ongedaan worden gemaakt.</p>
            <div class="alert__actions">
                <button class="alert__button" :disabled="isDeleting" @click="cancel">Annuleer</button>
                <button class="alert__button alert__button--destructive" :disabled="isDeleting" @click="confirm">Verwijder</button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use '../../assets/platform' as *;

.alert {
    position: fixed;
    inset: 0;
    z-index: 110;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--scrim);

    &__panel {
        width: 100%;
        max-width: 320px;
        padding: 22px 18px 18px;
        border-radius: 34px;
        text-align: center;
    }

    &__title {
        margin: 0 0 6px;
        font-size: 17px;
        font-weight: 600;
    }

    &__message {
        margin: 0 0 18px;
        font-size: 15px;
        color: var(--label-secondary);
    }

    &__actions {
        display: flex;
        gap: 10px;
    }

    &__button {
        flex: 1;
        height: 48px;
        border-radius: 100px;
        background: var(--fill);
        font-size: 17px;
        font-weight: 500;
        transition: transform 0.3s var(--ease-spring);

        &:active { transform: scale(0.95); }

        &--destructive {
            color: var(--red);
            font-weight: 600;
        }
    }
}

.alert {
    @include mac {
        &__panel {
            max-width: 260px;
            padding: 18px 16px 16px;
            border-radius: 20px;
        }

        &__title { font-size: 13px; }

        &__message {
            margin-bottom: 14px;
            font-size: 11px;
        }

        &__button {
            height: 28px;
            font-size: 13px;

            &:active { transform: none; }

            &--destructive {
                background: var(--red);
                color: #ffffff;
            }
        }
    }
}
</style>
