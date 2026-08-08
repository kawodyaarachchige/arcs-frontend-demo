import { BenefitCards, HomeHero } from "@/components/home/BenefitCards";
import { PageStory } from "@/components/layout/PageStory";

export default function HomePage() {
  return (
    <main className="page-main home-page">
      <HomeHero />

      <PageStory
        problem="On busy days, apps keep retrying the same failing call. People wait, and servers get hammered for no reason."
        whatYouSee="Same checkout twice, Once with fixed STATIC rules, once with ARIS. You can pretend the payment desk or the shop is in trouble."
        whoBenefits="Shoppers wait less. Developers manage retries in one place. IT Management wastes fewer calls and keeps an emergency STATIC switch."
      />

      <section className="home-section">
        <h2 className="section-heading">Who benefits..?</h2>
        <BenefitCards />
      </section>
    </main>
  );
}
