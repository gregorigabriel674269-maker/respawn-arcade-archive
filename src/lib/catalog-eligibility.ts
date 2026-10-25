export type RemovedGame = { name: string; status: string };

export function catalogEligible(
  game: { name: string; url: string },
  verification: Record<string, { status: string }>,
  removed: RemovedGame[],
): boolean {
  if (!game.url) return false;
  const excluded = (status: string | undefined) => status === 'down' || status === 'copyright';
  return !excluded(verification[game.name]?.status) && !removed.some(row => row.name === game.name && excluded(row.status));
}