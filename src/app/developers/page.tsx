"use client";

import {
  DeveloperTalkTrack,
  IntegrationExplainer,
  LastArisDecision,
} from "@/components/developers/DevPanels";
import { PageStory } from "@/components/layout/PageStory";

export default function DevelopersPage() {
  return (
    <main className="page-main">
      <p className="page-kicker">Developers</p>
      <h1 className="page-title">How Java asks ARIS</h1>
      <p className="page-lead">
        Plain words: the service asks ARIS “how many retries, how long to wait,
        how long a timeout..?” then uses those answers. Business code stays one
        helper call.
      </p>

      <PageStory
        problem="When every team copies its own retry settings, numbers drift and busy days get messier."
        whatYouSee="A simple integration sketch plus the last ARIS answers (retry, wait, timeout) from demo stats."
        whoBenefits="Developers keep one shared policy path instead of guessing per service."
      />

      <div className="two-col">
        <IntegrationExplainer />
        <LastArisDecision />
      </div>
      <DeveloperTalkTrack />
    </main>
  );
}
