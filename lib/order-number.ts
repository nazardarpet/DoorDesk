const ORDER_NUMBER_PREFIX = "ORD";
const ORDER_NUMBER_WIDTH = 5;

export function formatOrderNumber(sequence: number) {
  return `${ORDER_NUMBER_PREFIX}-${String(sequence).padStart(ORDER_NUMBER_WIDTH, "0")}`;
}

export function nextOrderNumberFromLatest(latestOrderNumber: string | null) {
  if (!latestOrderNumber) {
    return formatOrderNumber(1);
  }

  const match = latestOrderNumber.match(/^ORD-(\d+)$/);
  if (!match) {
    return formatOrderNumber(1);
  }

  return formatOrderNumber(Number(match[1]) + 1);
}
