/**
 * Calculate estimated reading time based on word count.
 * Average reading speed: 200-250 words per minute
 */

const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(text: string): number {
  if (!text) return 0;

  // Remove extra whitespace and split by spaces
  const words = text
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter((word) => word.length > 0);

  const minutes = Math.ceil(words.length / WORDS_PER_MINUTE);
  return Math.max(1, minutes); // Minimum 1 minute
}

export function formatReadingTime(minutes: number): string {
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}

export default calculateReadingTime;
