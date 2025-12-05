/**
 * Calculate profile completion percentage
 * This creates a psychological urge to "complete" the profile
 */
export function getProfileCompletion(user: any): {
  percentage: number;
  missing: string[];
} {
  const fields = [
    { key: 'name', label: 'Name', value: user?.name },
    { key: 'email', label: 'Email', value: user?.email },
    { key: 'bio', label: 'Bio', value: user?.bio },
    { key: 'school', label: 'School', value: user?.school },
    { key: 'interests', label: 'Interests', value: user?.interests?.length > 0 },
    { key: 'skills', label: 'Skills', value: user?.skills?.length > 0 },
    { key: 'status', label: 'Status', value: user?.status },
  ];

  const completed = fields.filter((f) => f.value).length;
  const percentage = Math.round((completed / fields.length) * 100);
  const missing = fields.filter((f) => !f.value).map((f) => f.label);

  return { percentage, missing };
}

/**
 * Get completion level badge
 */
export function getCompletionBadge(percentage: number): {
  emoji: string;
  label: string;
  color: string;
} {
  if (percentage === 100) {
    return { emoji: '⭐', label: 'Complete', color: '#10b981' };
  } else if (percentage >= 75) {
    return { emoji: '🎯', label: 'Almost There', color: '#3b82f6' };
  } else if (percentage >= 50) {
    return { emoji: '📝', label: 'In Progress', color: '#f59e0b' };
  } else {
    return { emoji: '🚀', label: 'Getting Started', color: '#ef4444' };
  }
}
