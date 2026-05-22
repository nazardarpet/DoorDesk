import { describe, expect, test } from "vitest";
import { getFilteredProductOptions, productToDoorLine, resolveDoorLineProduct } from "@/lib/order-form-products";

const products = [
  {
    id: "prod_caim_20",
    title: "Caiman",
    sku: "CAIM7020SC138",
    family: "Caiman",
    familyCode: "CAIM",
    familyName: "Caiman",
    style: "Caiman",
    core: "Solid Core",
    coreCode: "SC",
    height: "84",
    heightCode: "70",
    width: "24",
    widthCode: "20",
    thickness: "1.375",
    thicknessCode: "138"
  },
  {
    id: "prod_caim_24",
    title: "Caiman",
    sku: "CAIM7024SC138",
    family: "Caiman",
    familyCode: "CAIM",
    familyName: "Caiman",
    style: "Caiman",
    core: "Solid Core",
    coreCode: "SC",
    height: "84",
    heightCode: "70",
    width: "28",
    widthCode: "24",
    thickness: "1.375",
    thicknessCode: "138"
  },
  {
    id: "prod_carr_20",
    title: "Carrara",
    sku: "CARR7020HC138",
    family: "Carrara",
    familyCode: "CARR",
    familyName: "Carrara",
    style: "Carrara",
    core: "Hollow Core",
    coreCode: "HC",
    height: "84",
    heightCode: "70",
    width: "24",
    widthCode: "20",
    thickness: "1.375",
    thicknessCode: "138"
  }
];

describe("order form product helpers", () => {
  test("narrows parameter options based on selected family and width", () => {
    const options = getFilteredProductOptions(products, {
      productId: "",
      sku: "",
      familyCode: "CAIM",
      heightCode: "",
      widthCode: "20",
      coreCode: "",
      thicknessCode: "",
      family: "",
      style: "",
      height: "",
      width: "",
      thickness: "",
      core: "",
      quantity: "1",
      handing: "LEFT",
      notes: ""
    });

    expect(options.coreCodes).toEqual(["SC"]);
    expect(options.heightCodes).toEqual(["70"]);
    expect(options.widthCodes).toEqual(["20", "24"]);
  });

  test("resolves a complete parameter set to an exact product", () => {
    expect(
      resolveDoorLineProduct(products, {
        productId: "",
        sku: "",
        familyCode: "CAIM",
        heightCode: "70",
        widthCode: "20",
        coreCode: "SC",
        thicknessCode: "138",
        family: "",
        style: "",
        height: "",
        width: "",
        thickness: "",
        core: "",
        quantity: "1",
        handing: "LEFT",
        notes: ""
      })
    ).toEqual(products[0]);
  });

  test("copies selected product fields into a door line payload", () => {
    expect(productToDoorLine(products[0], "RIGHT")).toEqual({
      productId: "prod_caim_20",
      sku: "CAIM7020SC138",
      familyCode: "CAIM",
      heightCode: "70",
      widthCode: "20",
      coreCode: "SC",
      thicknessCode: "138",
      family: "Caiman",
      style: "Caiman",
      height: "84",
      width: "24",
      thickness: "1.375",
      core: "Solid Core",
      quantity: "1",
      handing: "RIGHT",
      notes: ""
    });
  });
});
