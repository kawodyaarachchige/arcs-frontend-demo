"use client";

import { PageStory } from "@/components/layout/PageStory";
import {
  ApprovedLimits,
  FailOpenStory,
  LeadershipTalkTrack,
} from "@/components/trust/TrustPanels";

export default function TrustPage() {
  return (
    <main className="page-main">
      <p className="page-kicker">Company Management</p>
      <h1 className="page-title">Trust &amp; limits</h1>
      <p className="page-lead">
        ARIS only turns dials inside rules a teacher already approved. STATIC
        stays the quiet backup when you want boring defaults.
      </p>

      <PageStory
        problem="Leaders worry that automatic systems will change production behaviour with no limits."
        whatYouSee="Approved-limit metaphor, what happens if the advisor is down, and a one-click Switch to STATIC control."
        whoBenefits="IT and company management get safer automation with a visible panic button."
      />

      <div className="two-col">
        <ApprovedLimits />
        <FailOpenStory />
      </div>
      <LeadershipTalkTrack />
    </main>
  );
}
