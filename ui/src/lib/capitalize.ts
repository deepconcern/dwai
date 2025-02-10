export function capitalize(word: string) {
  if (word.length === 0) return word;
  if (word.length === 1) return word.toLocaleUpperCase();
  return word[0].toLocaleUpperCase() + word.slice(1);
}
