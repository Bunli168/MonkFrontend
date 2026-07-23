<template>
    <svg width="100%" height="100%" viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="tnak-logo">
        <defs>
            <linearGradient id="td-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="1"/>
                <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0.5"/>
            </linearGradient>
        </defs>
        
        <g class="td-draw-group">
            <path class="td-shape td-spark" pathLength="100" d="M 17 3 Q 17 8 12 8 Q 17 8 17 13 Q 17 8 22 8 Q 17 8 17 3 Z" />

            <path class="td-shape td-bubble-1" pathLength="100" d="M 8 14 A 3 3 0 0 1 11 17 A 3 3 0 0 1 8 20 L 4 22 L 5.4 18.5 A 3 3 0 0 1 8 14 Z" />
            
            <circle class="td-shape td-bubble-2" pathLength="100" cx="17" cy="17" r="3" />
  
            <circle class="td-shape td-bubble-3" pathLength="100" cx="8" cy="26" r="3" />
            
            <path class="td-shape td-bubble-4" pathLength="100" d="M 17 23 A 3 3 0 0 1 19.6 27.5 L 22 30 L 17 29 A 3 3 0 0 1 14 26 A 3 3 0 0 1 17 23 Z" />
            
            <path class="td-shape td-t" pathLength="100" d="M 45 90 
                     L 37.5 90 
                     A 7.5 7.5 0 0 1 30 82.5 
                     L 30 50 
                     L 20 50 
                     A 7.5 7.5 0 0 1 20 35 
                     L 80 35 
                     L 80 50 
                     L 45 50 
                     Z" />

            <!-- The D (Digital Forward Motion & Hidden Checkmark) -->
            <path class="td-shape td-d" pathLength="100" d="M 30 25 
                     L 65 25 
                     A 25 25 0 0 1 65 75 
                     L 50 60 
                     L 50 90 
                     L 65 90 
                     A 40 40 0 0 0 65 10 
                     L 30 10 
                     A 7.5 7.5 0 0 0 30 25 
                     Z" />
        </g>
    </svg>
</template>

<style scoped>
.tnak-logo {
    overflow: visible;
}

.td-shape {
    fill: url(#td-gradient);
    stroke: url(#td-gradient);
    stroke-width: 1px;
    stroke-linecap: round;
    stroke-linejoin: round;
    
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    fill-opacity: 0;
    
    animation: draw-shape 1.2s cubic-bezier(0.8, 0, 0.2, 1) forwards;
}

.td-t { animation-delay: 0s; }
.td-d { animation-delay: 0.15s; }
.td-bubble-1 { animation-delay: 0.3s; }
.td-bubble-2 { animation-delay: 0.35s; }
.td-bubble-3 { animation-delay: 0.4s; }
.td-bubble-4 { animation-delay: 0.45s; }
.td-spark { animation-delay: 0.5s; }

@keyframes draw-shape {
    0% {
        stroke-dashoffset: 100;
        fill-opacity: 0;
    }
    60% {
        stroke-dashoffset: 0;
        fill-opacity: 0;
    }
    100% {
        stroke-dashoffset: 0;
        fill-opacity: 1;
    }
}
</style>