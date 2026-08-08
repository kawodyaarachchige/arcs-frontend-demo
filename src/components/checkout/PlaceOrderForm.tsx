"use client";

import { draftToPlaceOrderRequest } from "@/lib/demo/runCheckout";
import { useDemoStore } from "@/lib/store/demoStore";

export function PlaceOrderForm() {
  const draft = useDemoStore((s) => s.checkoutDraft);
  const setCheckoutDraft = useDemoStore((s) => s.setCheckoutDraft);
  const busy = useDemoStore((s) => s.busy);
  const runOneCheckout = useDemoStore((s) => s.runOneCheckout);
  const token = useDemoStore((s) => s.token);
  const line = draftToPlaceOrderRequest(draft);

  return (
    <form
      className="panel place-order-form"
      onSubmit={(e) => {
        e.preventDefault();
        void runOneCheckout();
      }}
    >
      <h2 className="panel-title">Place order</h2>
      <p className="panel-hint">
        Qty is for the demo UI only. The API receives item name, amount, and
        currency.
      </p>

      <label>
        Item
        <input
          value={draft.itemName}
          disabled={busy}
          onChange={(e) => setCheckoutDraft({ itemName: e.target.value })}
          required
        />
      </label>

      <div className="form-row">
        <label>
          Qty
          <input
            type="number"
            min={1}
            step={1}
            value={draft.qty}
            disabled={busy}
            onChange={(e) =>
              setCheckoutDraft({ qty: Number(e.target.value) || 1 })
            }
          />
        </label>
        <label>
          Unit price
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={draft.unitPrice}
            disabled={busy}
            onChange={(e) =>
              setCheckoutDraft({ unitPrice: Number(e.target.value) || 0.01 })
            }
          />
        </label>
        <label>
          Currency
          <input
            value={draft.currency}
            disabled={busy}
            onChange={(e) => setCheckoutDraft({ currency: e.target.value })}
          />
        </label>
      </div>

      <p className="line-total">
        Sends amount <strong>{line.amount.toFixed(2)}</strong> {line.currency}
      </p>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={busy || !token}
      >
        {busy ? "Working…" : "Place order"}
      </button>
      {!token ? (
        <p className="panel-hint warn">Sign in to place an order.</p>
      ) : null}
    </form>
  );
}
