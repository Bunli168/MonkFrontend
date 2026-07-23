<style scoped>
.footer {
    background-color: var(--card-bg-color);
    height: 250px;
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.footer .footer-bottom {
    height: 50px;
    background-color: teal;
    border-radius: var(--border-radius);
}
</style>

<template>
    <div class="footer">
        <div class="footer-top">
            <div class="container">
            </div>
        </div>
        <div class="footer-bottom"></div>
    </div>
</template>