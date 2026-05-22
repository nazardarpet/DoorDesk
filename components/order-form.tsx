"use client";

import { Handing } from "@prisma/client";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useActionState } from "react";
import { createOrderAndRedirectAction, updateOrderAction } from "@/app/actions/order-actions";
import { ActionFeedback } from "@/components/action-feedback";
import { PendingButton } from "@/components/pending-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/action-result";
import {
  getFilteredProductOptions,
  productToDoorLine,
  resolveDoorLineProduct,
  searchOrderProductsBySku,
  type OrderFormProduct
} from "@/lib/order-form-products";

type ClientOption = {
  id: string;
  label: string;
};

type DoorLine = {
  productId: string;
  sku: string;
  familyCode: string;
  heightCode: string;
  widthCode: string;
  coreCode: string;
  thicknessCode: string;
  family: string;
  style: string;
  height: string;
  width: string;
  thickness: string;
  core: string;
  quantity: string;
  handing: Handing;
  notes: string;
};

const blankLine: DoorLine = {
  productId: "",
  sku: "",
  familyCode: "",
  heightCode: "",
  widthCode: "",
  coreCode: "",
  thicknessCode: "",
  family: "",
  style: "",
  height: "",
  width: "",
  thickness: "",
  core: "Hollow Core",
  quantity: "1",
  handing: Handing.LEFT,
  notes: ""
};

export function OrderForm({
  clients,
  products,
  order
}: {
  clients: ClientOption[];
  products: OrderFormProduct[];
  order?: {
    id: string;
    clientId: string;
    notes: string | null;
    items: DoorLine[];
  };
}) {
  const [clientId, setClientId] = useState(order?.clientId ?? clients[0]?.id ?? "");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [items, setItems] = useState<DoorLine[]>(order?.items?.length ? order.items : [blankLine]);
  const action = order ? updateOrderAction : createOrderAndRedirectAction;
  const [state, formAction] = useActionState(action, initialActionState);

  const catalogProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product.sku &&
          product.familyCode &&
          product.heightCode &&
          product.widthCode &&
          product.coreCode &&
          product.thicknessCode
      ),
    [products]
  );
  const hasUnmatchedLines = items.some((item) => !item.productId || !item.sku);

  const payload = JSON.stringify({
    id: order?.id,
    clientId,
    notes,
    items
  });

  function updateLine(index: number, patch: Partial<DoorLine>) {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function setResolvedLine(index: number, nextLine: DoorLine) {
    const matchedProduct = resolveDoorLineProduct(catalogProducts, nextLine);
    if (matchedProduct) {
      updateLine(index, {
        ...productToDoorLine(matchedProduct, nextLine.handing, nextLine.notes, nextLine.quantity)
      });
      return;
    }

    updateLine(index, {
      ...nextLine,
      productId: "",
      sku: "",
      family: "",
      style: "",
      height: "",
      width: "",
      thickness: "",
      core: ""
    });
  }

  function duplicateLine(index: number) {
    setItems((current) => {
      const next = [...current];
      next.splice(index + 1, 0, { ...current[index] });
      return next;
    });
  }

  function applyProduct(index: number, value: string) {
    const product = catalogProducts.find((candidate) => candidate.id === value);
    if (!product) return;
    const currentLine = items[index];

    updateLine(index, {
      ...productToDoorLine(product, currentLine.handing, currentLine.notes, currentLine.quantity)
    });
  }

  function applySku(index: number, value: string) {
    const product = catalogProducts.find((candidate) => candidate.sku?.toUpperCase() === value.trim().toUpperCase());
    if (product) {
      applyProduct(index, product.id);
      return;
    }

    updateLine(index, { sku: value, productId: "" });
  }

  return (
    <form action={formAction} className="space-y-4">
      <ActionFeedback state={state} />
      <input type="hidden" name="payload" value={payload} />
      <Card className="grid gap-4 p-4 md:grid-cols-[minmax(240px,1fr)_2fr]">
        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Select id="client" value={clientId} onChange={(event) => setClientId(event.target.value)} required>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="order-notes">Order notes</Label>
          <Textarea id="order-notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>
      </Card>
      <div className="space-y-3">
        {items.map((item, index) => {
          const options = getFilteredProductOptions(catalogProducts, item);
          const skuMatches = searchOrderProductsBySku(catalogProducts, item.sku);
          const matchedProduct = item.productId ? catalogProducts.find((product) => product.id === item.productId) : null;
          const matchText = matchedProduct ? `${matchedProduct.sku ?? ""} / ${matchedProduct.title}` : "No matching product";

          return (
            <Card key={index} className="p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700">Door {index + 1}</div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => duplicateLine(index)}>
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_110px_110px_1fr]">
                <div className="space-y-1">
                  <Label>Family</Label>
                  <Select
                    aria-label={`Door ${index + 1} family`}
                    value={item.familyCode}
                    onChange={(event) => setResolvedLine(index, { ...item, familyCode: event.target.value })}
                    required
                  >
                    <option value="">Select...</option>
                    {options.familyOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>SKU search</Label>
                  <Input
                    list={`sku-options-${index}`}
                    value={item.sku}
                    onChange={(event) => applySku(index, event.target.value)}
                    aria-label={`Door ${index + 1} SKU search`}
                    placeholder="Search SKU"
                    required
                  />
                  <datalist id={`sku-options-${index}`}>
                    {skuMatches.map((product) => (
                      <option key={product.id} value={product.sku ?? ""}>
                        {product.sku}
                      </option>
                    ))}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <Label>Height</Label>
                  <Select
                    aria-label={`Door ${index + 1} height`}
                    value={item.heightCode}
                    onChange={(event) => setResolvedLine(index, { ...item, heightCode: event.target.value })}
                    required
                  >
                    <option value="">Select...</option>
                    {options.heightOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Width</Label>
                  <Select
                    aria-label={`Door ${index + 1} width`}
                    value={item.widthCode}
                    onChange={(event) => setResolvedLine(index, { ...item, widthCode: event.target.value })}
                    required
                  >
                    <option value="">Select...</option>
                    {options.widthOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Core</Label>
                  <Select
                    aria-label={`Door ${index + 1} core`}
                    value={item.coreCode}
                    onChange={(event) => setResolvedLine(index, { ...item, coreCode: event.target.value })}
                    required
                  >
                    <option value="">Select...</option>
                    {options.coreOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-[130px_1.4fr_80px_110px]">
                <div className="space-y-1">
                  <Label>Thick</Label>
                  <Select
                    aria-label={`Door ${index + 1} thickness`}
                    value={item.thicknessCode}
                    onChange={(event) => setResolvedLine(index, { ...item, thicknessCode: event.target.value })}
                    required
                  >
                    <option value="">Select...</option>
                    {options.thicknessOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Matched product</Label>
                  <Input
                    aria-label={`Door ${index + 1} matched product`}
                    value={matchText}
                    readOnly
                    className={matchedProduct ? "bg-slate-50" : "border-amber-300 bg-amber-50 text-amber-900"}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Qty</Label>
                  <Input value={item.quantity} onChange={(event) => updateLine(index, { quantity: event.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Handing</Label>
                  <Select value={item.handing} onChange={(event) => updateLine(index, { handing: event.target.value as Handing })}>
                    <option value={Handing.LEFT}>LH</option>
                    <option value={Handing.RIGHT}>RH</option>
                  </Select>
                </div>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr]">
                <div className="space-y-1">
                  <Label>Line notes</Label>
                  <Input value={item.notes} onChange={(event) => updateLine(index, { notes: event.target.value })} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="secondary" onClick={() => setItems((current) => [...current, blankLine])}>
          <Plus className="h-4 w-4" />
          Add another door
        </Button>
        <PendingButton disabled={hasUnmatchedLines} pendingText="Saving draft...">
          {order ? "Save order" : "Create draft order"}
        </PendingButton>
      </div>
    </form>
  );
}
