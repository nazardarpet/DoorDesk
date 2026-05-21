const CLIENT_ID_PREFIX = "CLT";
const CLIENT_ID_WIDTH = 5;

export function formatClientId(sequence: number) {
  return `${CLIENT_ID_PREFIX}-${String(sequence).padStart(CLIENT_ID_WIDTH, "0")}`;
}

export function nextClientIdFromLatest(latestClientId: string | null) {
  if (!latestClientId) {
    return formatClientId(1);
  }

  const match = latestClientId.match(/^CLT-(\d+)$/);
  if (!match) {
    return formatClientId(1);
  }

  return formatClientId(Number(match[1]) + 1);
}
