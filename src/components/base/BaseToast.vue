<template>
    <div class="toast-container position-fixed top-0 start-50 translate-middle-x p-2 mt-1">
        <TransitionGroup tag="div" class="d-flex flex-column align-items-center w-100" :css="false"
            @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
            <div v-for="toast in toastStore.toasts" :key="toast.id" @mouseenter="toastStore.pauseToast(toast.id)"
                @mouseleave="toastStore.resumeToast(toast.id)"
                class="toast mac-toast show d-flex align-items-center text-white border-0 mb-3"
                :class="`bg-${toast.type} toast-gradient`" role="alert" aria-live="assertive" aria-atomic="true">

                <div class="toast-body d-flex w-100 py-2 px-3 align-items-center">
                    <div class="me-2 d-flex align-items-center justify-content-center">
                        <component :is="getIcon(toast.type)" :size="18" stroke-width="2.5" />
                    </div>

                    <div class="d-flex flex-column justify-content-center flex-grow-1 overflow-hidden">
                        <span class="fw-medium toast-message">{{ toast.message }}</span>
                    </div>

                    <button type="button" class="btn-close btn-close-white shadow-none ms-3 p-1"
                        style="font-size: 0.55rem; opacity: 0.8;" @click="toastStore.removeToast(toast.id)"
                        aria-label="Close">
                    </button>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'
import gsap from 'gsap'
import { CheckCircle2, XCircle, AlertTriangle, Info, Bell } from '@lucide/vue'

const toastStore = useToastStore()

const getIcon = (type) => {
    switch (type) {
        case 'success': return CheckCircle2
        case 'danger': return XCircle
        case 'warning': return AlertTriangle
        case 'info': return Info
        default: return Bell
    }
}

const onBeforeEnter = (el) => {
    gsap.set(el, { opacity: 0, scale: 0.2, y: 0, transformOrigin: 'top center' })
}

const onEnter = (el, done) => {
    const isError = el.classList.contains('bg-danger');
    const tl = gsap.timeline({ onComplete: done });

    tl.to(el, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.5)'
    });

    if (isError) {
        tl.to(el, {
            keyframes: [
                { x: -8, duration: 0.1 },
                { x: 8, duration: 0.1 },
                { x: -8, duration: 0.1 },
                { x: 8, duration: 0.1 },
                { x: 0, duration: 0.1 }
            ],
            ease: "sine.inOut"
        }, "-=0.5");
    }
}

const onLeave = (el, done) => {
    // Smooth zoom back out
    gsap.to(el, {
        opacity: 0,
        scale: 0.5,
        y: -10,
        duration: 0.3,
        ease: 'power3.in',
        onComplete: done
    })
}
</script>

<style scoped>
.toast-container {
    z-index: 10000;
    pointer-events: none;
}

.mac-toast {
    pointer-events: auto;
    width: max-content;
    min-width: 240px;
    max-width: min(600px, calc(100vw - 32px));
    border-radius: var(--border-inner-radius) !important;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    overflow: hidden;
}

.toast-message {
    font-size: 0.85rem;
    letter-spacing: 0.2px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
    word-break: break-word;
}

.toast-gradient {
    background-image: linear-gradient(135deg,
            rgba(255, 255, 255, 0.25) 0%,
            rgba(255, 255, 255, 0.05) 100%);
}
</style>