export function initDynamicFavicon() {
    function updateFavicon() {
        const root = document.documentElement;
        const primaryColor = getComputedStyle(root).getPropertyValue('--primary-color').trim() || 'rgb(0, 109, 128)';

        const svgContent = `<svg viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="tnak-logo">
            <defs>
                <linearGradient id="td-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${primaryColor}" stop-opacity="1"/>
                    <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.5"/>
                </linearGradient>
            </defs>
            <g class="td-draw-group">
                <path class="td-shape td-spark" pathLength="100" d="M 17 3 Q 17 8 12 8 Q 17 8 17 13 Q 17 8 22 8 Q 17 8 17 3 Z" />
                <path class="td-shape td-bubble-1" pathLength="100" d="M 8 14 A 3 3 0 0 1 11 17 A 3 3 0 0 1 8 20 L 4 22 L 5.4 18.5 A 3 3 0 0 1 8 14 Z" />
                <circle class="td-shape td-bubble-2" pathLength="100" cx="17" cy="17" r="3" />
                <circle class="td-shape td-bubble-3" pathLength="100" cx="8" cy="26" r="3" />
                <path class="td-shape td-bubble-4" pathLength="100" d="M 17 23 A 3 3 0 0 1 19.6 27.5 L 22 30 L 17 29 A 3 3 0 0 1 14 26 A 3 3 0 0 1 17 23 Z" />
                <path class="td-shape td-t" pathLength="100" d="M 45 90 L 37.5 90 A 7.5 7.5 0 0 1 30 82.5 L 30 50 L 20 50 A 7.5 7.5 0 0 1 20 35 L 80 35 L 80 50 L 45 50 Z" />
                <path class="td-shape td-d" pathLength="100" d="M 30 25 L 65 25 A 25 25 0 0 1 65 75 L 50 60 L 50 90 L 65 90 A 40 40 0 0 0 65 10 L 30 10 A 7.5 7.5 0 0 0 30 25 Z" />
            </g>
            <style>
                .tnak-logo { overflow: visible; }
                .td-shape {
                    fill: url(#td-gradient);
                    stroke: url(#td-gradient);
                    stroke-width: 1px;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }
            </style>
        </svg>`;

        const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent.replace(/\s+/g, ' '));

        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/svg+xml';
            document.head.appendChild(link);
        }

        link.href = svgUrl;

        const appleLink = document.querySelector("link[rel='apple-touch-icon']");
        if (appleLink) {
            appleLink.href = svgUrl;
        }
    }

    setTimeout(updateFavicon, 100);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                updateFavicon();
            }
        });
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
}
