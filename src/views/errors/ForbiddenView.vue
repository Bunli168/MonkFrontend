<template>
    <div class="forbidden-wrapper p-3">
        <div class="forbidden-content flex-column text-center gap-3 p-5">
            <h1 class="fw-semibold text-danger display-1 mb-0">403</h1>
            <h3 class="fw-medium text-muted">Access Forbidden</h3>
            <p class="text-secondary mb-4">You do not have permission to view this page or perform this action.</p>
            <BaseButton variant="primary" @click="$router.push('/')">Return Home</BaseButton>
        </div>
    </div>
</template>

<style scoped>
.forbidden-wrapper {
    height: 100vh;
    width: 100vw;
    background-color: var(--surface-ground);
}

.forbidden-wrapper .forbidden-content {
    height: 100%;
    flex: 1;
    background-color: var(--body-bg-color);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
