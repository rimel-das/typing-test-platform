/**
 * Random utilities
 * Word generation, room codes, etc.
 */

/**
 * Generate random word list for typing test
 */
export function generateRandomWords(
  count: number,
  wordList: string[],
): string[] {
  if (wordList.length === 0) {
    throw new Error("Word list cannot be empty");
  }

  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    result.push(wordList[randomIndex]);
  }
  return result;
}

/**
 * Generate random room code for multiplayer
 */
export function generateRoomCode(length: number = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate test ID (UUID-like)
 */
export function generateId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Shuffle array
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default {
  generateRandomWords,
  generateRoomCode,
  generateId,
  shuffle,
};
