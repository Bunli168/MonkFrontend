<template>
    <span 
        class="badge fw-semibold d-inline-flex align-items-center justify-content-center gap-1"
        style="column-gap: 0.35rem !important;"
        :class="[
            badgeClasses,
            pill ? 'rounded-pill' : 'rounded',
            `size-${size}`
        ]"
    >
        <slot name="icon">
            <component v-if="loading" :is="Loader2" :size="iconSize" :stroke-width="2.2" class="flex-shrink-0 animate-spin" />
            <component v-else-if="displayIcon && typeof displayIcon !== 'string'" :is="displayIcon" :size="iconSize" :stroke-width="2.2" class="flex-shrink-0" />
            <i v-else-if="displayIcon && typeof displayIcon === 'string'" :class="displayIcon" class="flex-shrink-0"></i>
        </slot>

        <slot>
            <span style="display: inline-block; transform: translateY(0.5px);">{{ displayLabel }}</span>
        </slot>
    </span>
</template>

<script setup>
import { computed } from 'vue';
import { getStatusBadge, formatStatusLabel, getStatusIcon } from '@/utils/statusTheme';
import { Loader2 } from '@lucide/vue';

const props = defineProps({
    status: {
        type: String,
        default: ''
    },
    label: {
        type: [String, Number],
        default: ''
    },
    variant: {
        type: String,
        default: ''
    },
    icon: {
        type: [String, Object, Boolean, Function],
        default: null
    },
    pill: {
        type: Boolean,
        default: true
    },
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['sm', 'md', 'lg'].includes(val)
    },
    customMap: {
        type: Object,
        default: () => ({})
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const badgeClasses = computed(() => {
    if (props.variant) {
        return `bg-${props.variant}-subtle text-${props.variant}-emphasis`;
    }
    if (props.status) {
        return getStatusBadge(props.status, props.customMap);
    }
    return 'bg-secondary-subtle text-secondary-emphasis';
});

const displayLabel = computed(() => {
    if (props.label !== '') {
        return props.label;
    }
    if (props.status) {
        return formatStatusLabel(props.status);
    }
    return '';
});

const displayIcon = computed(() => {
    if (props.icon === false) {
        return null;
    }
    if (props.icon) {
        return props.icon;
    }
    if (props.status) {
        return getStatusIcon(props.status, props.customMap);
    }
    return null;
});

const iconSize = computed(() => {
    switch (props.size) {
        case 'sm':
            return 12;
        case 'lg':
            return 16;
        case 'md':
        default:
            return 13.5;
    }
});
</script>

<style scoped>
.badge {
    line-height: normal !important;
    letter-spacing: 0.03em !important;
    border: 1px solid transparent !important;
    font-weight: 600 !important;
}

.size-sm {
    padding: 0.2rem 0.5rem !important;
    font-size: 0.65rem !important;
}

.size-md {
    padding: 0.25rem 0.6rem !important;
    font-size: 0.68rem !important;
}

.size-lg {
    padding: 0.35rem 0.75rem !important;
    font-size: 0.78rem !important;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.animate-spin {
    animation: spin 1s linear infinite;
}
</style>
