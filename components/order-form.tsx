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

type ClientOption = {
  id: string;
  label: string;
};

type ProductOption = {
  id: string;
  title: string;
  sku: string | null;
  family: string | null;
  style: string | null;
  core: string | null;
  height: string | null;
  width: string | null;
  thickness: string | null;
};

type DoorLine = {
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
  products: ProductOption[];
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

  const families = useMemo(
    () => Array.from(new Set(products.map((product) => product.family).filter(Boolean))).sort() as string[],
    [products]
  );
  const cores = useMemo(
    () =>
      Array.from(new Set(["Hollow Core", "Solid Core", "Structural Composite", ...products.map((product) => product.core).filter(Boolean)])).sort() as string[],
    [products]
  );

  const payload = JSON.stringify({
    id: order?.id,
    clientId,
    notes,
    items
  });

  function updateLine(index: number, patch: Partial<DoorLine>) {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function duplicateLine(index: number) {
    setItems((current) => {
      const next = [...current];
      next.splice(index + 1, 0, { ...current[index] });
      return next;
    });
  }

  function applyProduct(index: number, value: string) {
    const product = products.find((candidate) => candidate.id === value);
    if (!product) return;

    updateLine(index, {
      family: product.family ?? "",
      style: product.style ?? "",
      core: product.core ?? "",
      height: product.height ?? "",
      width: product.width ?? "",
      thickness: product.thickness ?? ""
    });
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
          const styles = Array.from(
            new Set(
              products
                .filter((product) => !item.family || product.family === item.family)
                .map((product) => product.style)
                .filter(Boolean)
            )
          ).sort() as string[];

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
              <div className="grid gap-3 md:grid-cols-[1.1fr_1.1fr_90px_90px_90px_1fr_80px_110px]">
                <div className="space-y-1">
                  <Label>Catalog</Label>
                  <Select defaultValue="" onChange={(event) => applyProduct(index, event.target.value)}>
                    <option value="">Select...</option>
                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {[
                          product.title,
                          product.sku,
                          product.height && product.width ? `${product.height} x ${product.width}` : undefined,
                          product.thickness && `${product.thickness} thick`,
                          product.core
                        ]
                          .filter(Boolean)
                          .join(" / ")}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Family</Label>
                  <Input list="families" value={item.family} onChange={(event) => updateLine(index, { family: event.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Height</Label>
                  <Input value={item.height} onChange={(event) => updateLine(index, { height: event.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Width</Label>
                  <Input value={item.width} onChange={(event) => updateLine(index, { width: event.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Thick</Label>
                  <Input value={item.thickness} onChange={(event) => updateLine(index, { thickness: event.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Style</Label>
                  <Input list={`styles-${index}`} value={item.style} onChange={(event) => updateLine(index, { style: event.target.value })} required />
                  <datalist id={`styles-${index}`}>
                    {styles.map((style) => (
                      <option key={style} value={style} />
                    ))}
                  </datalist>
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
              <div className="mt-3 grid gap-3 md:grid-cols-[220px_1fr]">
                <div className="space-y-1">
                  <Label>Core</Label>
                  <Input list="cores" value={item.core} onChange={(event) => updateLine(index, { core: event.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label>Line notes</Label>
                  <Input value={item.notes} onChange={(event) => updateLine(index, { notes: event.target.value })} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <datalist id="families">
        {families.map((family) => (
          <option key={family} value={family} />
        ))}
      </datalist>
      <datalist id="cores">
        {cores.map((core) => (
          <option key={core} value={core} />
        ))}
      </datalist>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="secondary" onClick={() => setItems((current) => [...current, blankLine])}>
          <Plus className="h-4 w-4" />
          Add another door
        </Button>
        <PendingButton pendingText="Saving draft...">{order ? "Save order" : "Create draft order"}</PendingButton>
      </div>
    </form>
  );
}
