<template>
    <div class="notfound-wrapper p-3">
        <div class="notfound-content flex-column text-center gap-3 p-5">
            <h1 class="fw-semibold text-primary display-1 mb-0">404</h1>
            <h3 class="fw-medium text-muted">Page Not Found</h3>
            <p class="text-secondary mb-4">The page you are looking for doesn't exist or has been moved.</p>
            <BaseButton variant="primary" @click="$router.push('/')">Return Home</BaseButton>
        </div>
    </div>
</template>
<style scoped>
.notfound-wrapper {
    height: 100vh;
    width: 100vw;
    background-color: var(--surface-ground);
}

.notfound-wrapper .notfound-content {
    height: 100%;
    flex: 1;
    background-color: var(--body-bg-color);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>