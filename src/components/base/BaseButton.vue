<script setup>
const props = defineProps({
    label: { type: String, default: '' },
    badge: { type: [String, Number], default: null },
    variant: { type: String, default: 'primary' },
    isLoading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
})

import BadgeStatSkeleton from '@/components/skeletons/BadgeStatSkeleton.vue';
</script>

<template>
    <button :class="`btn-${variant}`" :disabled="isLoading || disabled">
        <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true" style="border-width: 0.15em;"></span>
        
        <slot>{{ label }}</slot>

        <template v-if="$slots.badge">
            <slot name="badge"></slot>
        </template>

        <div class="custom-badge p-0 bg-transparent" v-else-if="badge === '...'">
            <BadgeStatSkeleton />
        </div>
        <div class="custom-badge" v-else-if="badge !== null && badge !== undefined && badge !== false">{{ badge }}</div>
    </button>
</template>

<style scoped>
button {
    border-radius: var(--border-inner-radius);
    height: var(--control-height);
    color: var(--text-white);
    padding-inline: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: none;
    font-size: 0.95rem;
    font-weight: 500;
}

button:disabled,
button:hover {
    opacity: 0.8;
}

button.btn-primary {
    background-color: var(--primary-color) !important;
}

button.btn-outline,
button.btn-outline-primary {
    background-color: transparent !important;
    border: var(--border-width) solid var(--border-clr);
    transition: border-color 0.3s ease;
    color: var(--text-base);
}

button:hover.btn-outline,
button:hover.btn-outline-primary,
button:hover.btn-badge {
    border-color: var(--primary-color);
}

button.btn-warning {
    background-color: var(--warning-color) !important;
    text-shadow: 0.5px 0.5px #999;
}

button.btn-outline-warning {
    border: var(--border-width) solid var(--border-clr);
    background-color: transparent;
    color: var(--text-warning);
    transition: border-color 0.3s ease;
}

button.btn-danger {
    background-color: var(--danger-color);
}

button.btn-outline-danger {
    border: var(--border-width) solid var(--border-clr);
    background-color: transparent;
    color: var(--text-danger);
    transition: border-color 0.3s ease;
}

button.btn-secondary {
    background-color: var(--secondary-color);
}

button.btn-outline-secondary {
    border: var(--border-width) solid var(--border-clr);
    background-color: transparent;
    color: var(--text-secondary);
    transition: border-color 0.3s ease;
}

button.btn-success {
    background-color: var(--success-color);
}

button.btn-outline-success {
    border: var(--border-width) solid var(--border-clr);
    background-color: transparent;
    color: var(--text-success);
    transition: border-color 0.3s ease;
}

button:hover.btn-outline-danger,
button:hover.btn-outline-secondary,
button:hover.btn-outline-warning,
button:hover.btn-outline-success {
    border-color: var(--border-hover-color);
}

button.btn-badge {
    background-color: var(--body-bg-color);
    border: var(--border-width) solid transparent;
    color: var(--text-base);
    transition: border-color 0.3s ease;
}

button.btn-badge.primary.active,
button.btn-badge.success.active,
button.btn-badge.warning.active,
button.btn-badge.danger.active,
button.btn-badge.info.active,
button.btn-badge.secondary.active {
    background-color: var(--primary-color-soft) !important;
}

button.btn-badge.success .custom-badge {
    color: var(--success-color);
}

button.btn-badge.warning .custom-badge {
    color: var(--warning-color);
}

button.btn-badge.danger .custom-badge {
    color: var(--danger-color);
}

button.btn-badge.info .custom-badge {
    color: var(--info-color);
}

button.btn-badge.secondary .custom-badge {
    color: var(--secondary-color);
}

.btn-badge .custom-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: var(--surface-ground);
    border-radius: var(--border-inner-radius) !important;
    padding: 12px 8px;
    height: 1.2rem;
    font-size: 12px;
    color: var(--primary-color);
    font-weight: 700;
}
</style>