import CryptoJS from 'crypto-js';

/**
 * Generate Gravatar URL from email address
 * Gravatar is a free service that provides profile pictures based on email
 */
export function getGravatarUrl(email: string, size: number = 200): string {
  if (!email) {
    return `https://ui-avatars.com/api/?name=User&size=${size}&background=6366f1&color=fff`;
  }

  // Trim and lowercase the email
  const trimmedEmail = email.trim().toLowerCase();

  // Generate MD5 hash
  const hash = CryptoJS.MD5(trimmedEmail).toString();

  // Generate Gravatar URL with fallback to UI Avatars
  const fallback = encodeURIComponent(`https://ui-avatars.com/api/?name=${email}&size=${size}&background=6366f1&color=fff`);

  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${fallback}`;
}

/**
 * Generate UI Avatars URL (fallback when user doesn't have Gravatar)
 */
export function getUIAvatarUrl(name: string, size: number = 200): string {
  const displayName = name || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=${size}&background=6366f1&color=fff&bold=true`;
}
