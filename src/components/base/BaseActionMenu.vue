<template>
    <div class="base-action-menu d-inline-block">
        <button class="btn btn-sm btn-link text-muted p-1 border-0 rounded-circle action-btn" @click.stop="toggle" aria-haspopup="true" aria-controls="overlay_menu">
            <div class="icon-wrapper">
                <EllipsisVertical class="icon-default" :class="{ 'is-hidden': isOpen }" :size="20" />
                <X class="icon-active" :class="{ 'is-visible': isOpen }" :size="20" />
            </div>
        </button>
        <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" @show="isOpen = true" @hide="isOpen = false">
            <template #item="{ item, props }">
                <a v-bind="props.action" @click="handleItemClick($event, item)" class="d-flex align-items-center px-3 py-2 text-decoration-none action-item-link" :class="item.class">
                    <component v-if="item.icon" :is="item.icon" :size="16" class="me-2" :class="item.iconClass || 'text-muted'" />
                    <span :class="item.textClass || 'text-base'">{{ item.label }}</span>
                    <BaseBadge v-if="item.badge" :status="item.badge" class="ms-2" size="sm" />
                </a>
            </template>
        </Menu>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Menu } from 'primevue';
import { EllipsisVertical, X } from '@lucide/vue';

const props = defineProps({
    items: {
        type: Array,
        required: true,
    }
});

const menu = ref();
const isOpen = ref(false);

const toggle = (event) => {
    menu.value.toggle(event);
};

const handleItemClick = (event, item) => {
    if (item.command) {
        item.command({ originalEvent: event, item });
    }
    menu.value.hide();
};
</script>

<style scoped>
.action-btn {
    position: relative;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
}

.action-btn:hover {
    background-color: var(--border-clr);
}

.icon-wrapper {
    position: relative;
    width: 20px;
    height: 20px;
}

.icon-default, .icon-active {
    position: absolute;
    top: 0;
    left: 0;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-default {
    opacity: 1;
    transform: rotate(0) scale(1);
}

.icon-default.is-hidden {
    opacity: 0;
    transform: rotate(-90deg) scale(0.5);
}

.icon-active {
    opacity: 0;
    transform: rotate(90deg) scale(0.5);
}

.icon-active.is-visible {
    opacity: 1;
    transform: rotate(0) scale(1);
}

.action-item-link {
    cursor: pointer;
    border-radius: calc(var(--border-inner-radius) - (0.25rem*2)) !important;
    transition: background-color 0.2s;
    font-size: 0.9rem;
}

.action-item-link:hover {
    background-color: var(--body-bg-color) !important;
}
</style>
