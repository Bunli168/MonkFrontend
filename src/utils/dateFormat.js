export function formatDate(date) {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Phnom_Penh',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(new Date(date));
}

export function formatDateTime(date) {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Phnom_Penh',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(new Date(date));
}

export function formatTimeAgo(date) {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSecs < 60) return 'ប៉ុន្មានវិនាទីមុន';
    if (diffMins < 60) return `${diffMins} នាទីមុន`;
    if (diffHours < 24) return `${diffHours} ម៉ោងមុន`;
    if (diffDays < 7) return `${diffDays} ថ្ងៃ​មុន`;
    if (diffWeeks < 4) return `${diffWeeks} សប្ដាហ៍មុន`;
    if (diffMonths < 12) return `${diffMonths} ខែមុន`;
    return `${diffYears} ឆ្នាំ​មុន`;
}