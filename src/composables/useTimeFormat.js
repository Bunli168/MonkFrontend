/**
 * Utility composable for common date, time, and string formatting
 */
export function useTimeFormat() {
  const toYMD = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const formatFriendlyDateShort = (date) => {
    if (!date) return ''
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }).format(new Date(date))
  }

  const capitalizeWord = (str) => {
    if (!str) return ''
    return str.charAt(0) + str.slice(1).toLowerCase()
  }

  const formatMinToTime = (totalMin) => {
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
  }

  const formatMinutes = (min) => {
    const h = Math.floor(min / 60)
    const m = min % 60
    if (h > 0 && m > 0) return `${h}h ${m}m`
    if (h > 0) return `${h}h`
    return `${m}m`
  }
  
  const formatType = (type) => {
    if (!type) return '—'
    return type.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
  }

  return {
    toYMD,
    formatFriendlyDateShort,
    capitalizeWord,
    formatMinToTime,
    timeToMinutes,
    formatMinutes,
    formatType
  }
}
