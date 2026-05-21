function fractionToDecimal(value: string) {
  const [wholePart, fractionPart] = value.trim().split("-");
  if (!fractionPart) {
    const [numerator, denominator] = wholePart.split("/").map(Number);
    return denominator ? numerator / denominator : Number(wholePart);
  }

  const [numerator, denominator] = fractionPart.split("/").map(Number);
  return Number(wholePart) + numerator / denominator;
}

export function parseDimensionText(text: string) {
  const primaryMatch = text.match(/\((\d+(?:\.\d+)?)"\)/);
  const thicknessMatch = text.match(/(\d+(?:-\d+\/\d+)?|\d+\/\d+|\d+(?:\.\d+)?)"\s*thick/i);

  return {
    primary: primaryMatch ? Number(primaryMatch[1]) : undefined,
    thickness: thicknessMatch ? fractionToDecimal(thicknessMatch[1]) : undefined
  };
}
