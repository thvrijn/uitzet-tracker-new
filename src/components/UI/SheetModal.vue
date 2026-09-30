<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

defineProps<{ title?: string }>();
const emit = defineEmits<{ close: [] }>();

const closeOnEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') emit('close');
};

onMounted(() => window.addEventListener('keydown', closeOnEscape));
onUnmounted(() => window.removeEventListener('keydown', closeOnEscape));
</script>

<template>
    <div class="sheet" @click.self="$emit('close')">
        <div class="sheet__panel modal-panel" role="dialog" :aria-label="title">
            <header class="sheet__bar">
                <div class="sheet__bar-side sheet__bar-side--leading">
                    <slot name="leading" />
                </div>
                <h2 class="sheet__title">{{ title }}</h2>
                <div class="sheet__bar-side sheet__bar-side--trailing">
                    <slot name="trailing" />
                </div>
            </header>
            <div class="sheet__content">
                <slot />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use '../../assets/platform' as *;

.sheet {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: calc(env(safe-area-inset-top) + 24px) 24px calc(env(safe-area-inset-bottom) + 24px);
    background: var(--scrim);

    &__panel {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 580px;
        max-height: 100%;
        border-radius: 38px;
        background: var(--background);
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
        overflow: hidden;
    }

    &__bar {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 8px;
        padding: 16px 16px 8px;
    }

    &__bar-side {
        display: flex;
        gap: 8px;

        &--trailing { justify-content: flex-end; }
    }

    &__title {
        margin: 0;
        font-size: 17px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__content {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 12px 20px 8px;
        -webkit-overflow-scrolling: touch;
    }

    // iOS: sheet rises from the bottom, inset like iOS 26
    @include phone {
        align-items: flex-end;
        padding: calc(env(safe-area-inset-top) + 12px) 8px calc(env(safe-area-inset-bottom) + 8px);

        .sheet__panel {
            max-width: none;
            height: 100%;
        }
    }

    // macOS: sheet hangs below the toolbar; title on top, push buttons bottom-right
    @include mac {
        align-items: flex-start;
        padding: 56px 24px 24px;

        .sheet__panel {
            display: grid;
            grid-template-columns: 1fr auto auto;
            grid-template-rows: auto minmax(0, 1fr) auto;
            grid-template-areas:
                'title title title'
                'content content content'
                '. leading trailing';
            max-width: 460px;
            border-radius: 22px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.22), 0 0 0 0.5px var(--separator);
        }

        .sheet__bar { display: contents; }

        .sheet__title {
            grid-area: title;
            padding: 18px 20px 6px;
            font-size: 15px;
            text-align: center;
        }

        .sheet__content {
            grid-area: content;
            padding: 12px 20px 4px;
        }

        .sheet__bar-side {
            padding: 12px 0 16px;

            &--leading {
                grid-area: leading;
                padding-right: 8px;
            }

            &--trailing {
                grid-area: trailing;
                padding-right: 20px;
            }
        }
    }
}
</style>
