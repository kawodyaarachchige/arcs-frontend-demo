import Link from "next/link";

const BENEFITS = [
  {
    audience: "Normal users",
    title: "Fewer failed checkouts on busy days",
    body: "When the shop or payment desk is under stress, shoppers see less endless spinning and fewer dead ends. Same checkout button calmer under load.",
  },
  {
    audience: "Developers",
    title: "One place for retry behaviour",
    body: "Backend asks ARIS how many times to try again, how long to wait, and how long to wait for an answer. Teams stop copying fragile retry loops into every service.",
  },
  {
    audience: "IT & company leadership",
    title: "Less wasted traffic, clearer control",
    body: "Smarter choices cut useless extra calls. Approved limits and a one-click STATIC fallback keep automation inside clear rules.",
  },
] as const;

export function BenefitCards() {
  return (
    <div className="benefit-grid">
      {BENEFITS.map((card) => (
        <article key={card.audience} className="benefit-card">
          <p className="benefit-audience">{card.audience}</p>
          <h3 className="benefit-title">{card.title}</h3>
          <p className="benefit-body">{card.body}</p>
        </article>
      ))}
    </div>
  );
}

export function HomeHero() {
  return (
    <section className="home-hero">
      <p className="home-eyebrow">Live product demo</p>
      <h1 className="home-brand">ARIS</h1>
      <p className="home-headline">
        When checkout gets busy, fixed retry rules keep knocking the same way —
        ARIS chooses how long to wait and whether to try again so the same order
        path stays calmer.
      </p>
      <p className="home-support">
        Watch one customer place-order under STATIC fixed rules versus ARIS —
        including problems in the order path and the payment path.
      </p>
      <div className="home-cta-row">
        <Link className="btn btn-primary btn-lg" href="/checkout">
          Try the live demo
        </Link>
        <Link className="btn btn-secondary btn-lg btn-on-light" href="/cost">
          See the cost story
        </Link>
      </div>
    </section>
  );
}
