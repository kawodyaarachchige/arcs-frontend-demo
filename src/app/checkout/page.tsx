"use client";

import { CheckoutResult } from "@/components/checkout/CheckoutResult";
import { ComparePanel } from "@/components/checkout/ComparePanel";
import { PlaceOrderForm } from "@/components/checkout/PlaceOrderForm";
import { RequestTimeline } from "@/components/checkout/RequestTimeline";
import { RunHistoryTable } from "@/components/checkout/RunHistoryTable";
import { PageStory } from "@/components/layout/PageStory";

export default function CheckoutPage() {
  return (
    <main className="page-main">
      <p className="page-kicker">Customer demo</p>
      <h1 className="page-title">Checkout</h1>
      <p className="page-lead">
        Same place-order button every time. Change Policy and Scenario in the
        sticky bar to compare STATIC fixed rules with ARIS. Including shop
        problems and payment problems.
      </p>

      <PageStory
        problem="The customer only sees spinning or “failed”. They never learn where it broke."
        whatYouSee="An order form, a big result, a step-by-step timeline, a STATIC vs ARIS compare, and a run log table with Good/Bad takeaways."
        whoBenefits="You can show “the shop broke” vs “payment broke” clearly and how ARIS wastes fewer knocks than STATIC."
      />

      <div className="checkout-layout">
        <PlaceOrderForm />
        <div className="checkout-main-col">
          <CheckoutResult />
          <RequestTimeline />
        </div>
      </div>

      <ComparePanel />
      <RunHistoryTable />
    </main>
  );
}
