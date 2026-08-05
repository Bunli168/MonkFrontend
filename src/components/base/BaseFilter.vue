<template>
    <div class="base-filter-wrapper position-relative" ref="containerRef">
        <div class="measurement-container" v-if="!wrap" aria-hidden="true" style="visibility: hidden; position: absolute; z-index: -1; white-space: nowrap; display: flex; gap: 0.5rem; top: 0; left: 0; width: 0; height: 0; overflow: hidden;">
            <div v-for="option in options" :key="'measure-' + option.value" :ref="el => { if(el) measureRefs[option.value] = el }">
                <BaseButton type="button" variant="badge" :label="option.label" :badge="option.badge" />
            </div>
            <!-- Measure the 'More' button -->
            <div ref="moreBtnRef">
                <BaseButton type="button" variant="badge" :badge="options.length">
                    <Filter :size="16" /> More
                </BaseButton>
            </div>
        </div>

        <!-- Actual Visible Container -->
        <div class="d-flex align-items-center gap-2" :class="wrap ? 'flex-wrap flex-lg-nowrap' : ''">
            <!-- Visible Options -->
            <BaseButton 
                v-for="option in visibleOptions" 
                :key="option.value"
                type="button" 
                class="text-nowrap flex-grow-1 flex-lg-grow-0"
                :variant="modelValue === option.value ? (option.variant ? `badge ${option.variant} active` : 'badge primary active') : (option.variant ? `badge ${option.variant}` : 'badge')"
                :label="option.label"
                :badge="option.badge" 
                @click="selectOption(option.value)"
            />

            <!-- More Button (if hidden options exist) -->
            <div v-if="hiddenOptions.length > 0">
                <BaseButton 
                    type="button" 
                    :variant="hasActiveHiddenOption ? 'badge primary' : 'badge'" 
                    :badge="hiddenOptions.length"
                    @click="showModal = true"
                >
                    <Filter :size="16" /> More
                </BaseButton>
                
                <BaseModal v-model="showModal" title="More Filters" size="sm" contentClass="p-3">
                    <div class="d-flex flex-wrap gap-2">
                        <BaseButton 
                            v-for="option in hiddenOptions"
                            :key="'hidden-' + option.value"
                            type="button" 
                            class="flex-grow-1"
                            :variant="modelValue === option.value ? 'badge primary' : (option.variant ? `badge ${option.variant}` : 'badge')"
                            :label="option.label"
                            :badge="option.badge" 
                            @click="selectHiddenOption(option.value)"
                        />
                    </div>
                </BaseModal>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { Filter } from '@lucide/vue';
import BaseButton from './BaseButton.vue';
import BaseModal from './BaseModal.vue';

const props = defineProps({
    modelValue: {
        type: [String, Number, null],
        default: null
    },
    options: {
        type: Array,
        default: () => []
    },
    wrap: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'change']);

const containerRef = ref(null);
const measureRefs = ref({});
const moreBtnRef = ref(null);
const showModal = ref(false);

const visibleCount = ref(props.options.length);

const visibleOptions = computed(() => {
    return props.options.slice(0, visibleCount.value);
});

const hiddenOptions = computed(() => {
    return props.options.slice(visibleCount.value);
});

const hasActiveHiddenOption = computed(() => {
    return hiddenOptions.value.some(opt => opt.value === props.modelValue);
});

const selectOption = (val) => {
    emit('update:modelValue', val);
    emit('change', val);
};

const selectHiddenOption = (val) => {
    selectOption(val);
    showModal.value = false;
};

// Resize logic
let resizeObserver = null;
const gapWidth = 8; // 0.5rem gap = 8px

const calculateVisibleItems = () => {
    if (props.wrap) {
        visibleCount.value = props.options.length;
        return;
    }
    if (!containerRef.value) return;
    
    const containerWidth = containerRef.value.clientWidth;
    const moreBtnWidth = moreBtnRef.value ? moreBtnRef.value.offsetWidth : 40;
    
    let currentWidth = 0;
    let newVisibleCount = 0;

    for (let i = 0; i < props.options.length; i++) {
        const opt = props.options[i];
        const el = measureRefs.value[opt.value];
        if (!el) break;
        
        const itemWidth = el.offsetWidth + gapWidth;
        
        // If we are at the last item, we don't need the 'More' button unless it overflows
        if (i === props.options.length - 1) {
            if (currentWidth + itemWidth <= containerWidth) {
                newVisibleCount++;
            }
        } else {
            // Check if this item PLUS the 'More' button fits
            if (currentWidth + itemWidth + moreBtnWidth + gapWidth <= containerWidth) {
                currentWidth += itemWidth;
                newVisibleCount++;
            } else {
                break; // Stop fitting items
            }
        }
    }
    
    visibleCount.value = newVisibleCount;
};

onMounted(() => {
    nextTick(() => {
        calculateVisibleItems();
        
        resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                calculateVisibleItems();
            });
        });
        
        if (containerRef.value) {
            resizeObserver.observe(containerRef.value);
        }
    });
});

onUnmounted(() => {
    if (resizeObserver && containerRef.value) {
        resizeObserver.unobserve(containerRef.value);
    }
});

// Re-calculate if options change
watch(() => props.options, () => {
    nextTick(() => {
        calculateVisibleItems();
    });
}, { deep: true });

</script>

<style scoped>
/* No custom styles needed anymore since we use standard BaseButtons */
</style>
