export type ParsedProductSku = {
  sku: string;
  familyCode: string;
  familyName: string;
  heightCode: string;
  height: number;
  heightLabel: string;
  widthCode: string;
  width: number;
  widthLabel: string;
  coreCode: string;
  core: string;
  thicknessCode: string;
  thickness: number;
  thicknessLabel: string;
};

export const productFamilyCodes = {
  "6PPRIMBIF": "Smooth Bifold",
  "FPRIMBIF": "Flush Bifold",
  "CAIMBIF": "Caiman Bifold",
  "CARRBIF": "Carrara Bifold",
  "5PROCK": "Rockport",
  "6PPRIM": "Smooth",
  "FPRIM": "Flush",
  "CAIM": "Caiman",
  "CARR": "Carrara"
} as const;

export const productHeightCodes = {
  "68": { value: 80, label: "6'8\" (80\")" },
  "70": { value: 84, label: "7'0\" (84\")" },
  "80": { value: 96, label: "8'0\" (96\")" }
} as const;

export const productWidthCodes = {
  "10": { value: 12, label: "1'0\" (12\")" },
  "12": { value: 14, label: "1'2\" (14\")" },
  "13": { value: 15, label: "1'3\" (15\")" },
  "14": { value: 16, label: "1'4\" (16\")" },
  "16": { value: 18, label: "1'6\" (18\")" },
  "18": { value: 20, label: "1'8\" (20\")" },
  "19": { value: 21, label: "1'9\" (21\")" },
  "20": { value: 24, label: "2'0\" (24\")" },
  "22": { value: 26, label: "2'2\" (26\")" },
  "23": { value: 27, label: "2'3\" (27\")" },
  "24": { value: 28, label: "2'4\" (28\")" },
  "26": { value: 30, label: "2'6\" (30\")" },
  "28": { value: 32, label: "2'8\" (32\")" },
  "30": { value: 36, label: "3'0\" (36\")" },
  "32": { value: 38, label: "3'2\" (38\")" },
  "34": { value: 40, label: "3'4\" (40\")" },
  "36": { value: 42, label: "3'6\" (42\")" },
  "40": { value: 48, label: "4'0\" (48\")" },
  "110": { value: 22, label: "1'10\" (22\")" },
  "210": { value: 34, label: "2'10\" (34\")" }
} as const;

export const productCoreCodes = {
  HC: "Hollow Core",
  SC: "Solid Core"
} as const;

export const productThicknessCodes = {
  "138": { value: 1.375, label: "1-3/8\"" },
  "134": { value: 1.75, label: "1-3/4\"" }
} as const;

const familyCodesByLength = Object.keys(productFamilyCodes).sort((left, right) => right.length - left.length);

function getRecordValue<T>(record: Record<string, T>, key: string) {
  return Object.prototype.hasOwnProperty.call(record, key) ? record[key] : undefined;
}

export function parseProductSku(rawSku: string | null | undefined): ParsedProductSku | null {
  const sku = rawSku?.trim().toUpperCase();
  if (!sku) {
    return null;
  }

  const familyCode = familyCodesByLength.find((code) => sku.startsWith(code));
  if (!familyCode) {
    return null;
  }

  const remainder = sku.slice(familyCode.length);
  const match = remainder.match(/^(\d{2})(\d+)(HC|SC)(\d{3})$/);
  if (!match) {
    return null;
  }

  const [, heightCode, widthCode, coreCode, thicknessCode] = match;
  const familyName = getRecordValue(productFamilyCodes, familyCode);
  const height = getRecordValue(productHeightCodes, heightCode);
  const width = getRecordValue(productWidthCodes, widthCode);
  const core = getRecordValue(productCoreCodes, coreCode);
  const thickness = getRecordValue(productThicknessCodes, thicknessCode);

  if (!familyName || !height || !width || !core || !thickness) {
    return null;
  }

  return {
    sku,
    familyCode,
    familyName,
    heightCode,
    height: height.value,
    heightLabel: height.label,
    widthCode,
    width: width.value,
    widthLabel: width.label,
    coreCode,
    core,
    thicknessCode,
    thickness: thickness.value,
    thicknessLabel: thickness.label
  };
}
