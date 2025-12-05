/**
 * Convert timestamp to relative time (e.g., "2h ago", "3d ago")
 * This creates urgency and makes content feel fresh
 */
export function timeAgo(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  if (seconds < 60) {
    return 'just now';
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval}${unit.charAt(0)} ago`; // e.g., "2h ago", "3d ago"
    }
  }

  return 'just now';
}

/**
 * Check if timestamp is within last N hours
 * Useful for showing "NEW" badges
 */
export function isRecent(timestamp: string | Date, hours: number = 24): boolean {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diffInHours < hours;
}
