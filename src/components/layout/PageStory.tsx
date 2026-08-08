export function PageStory({
  problem,
  whatYouSee,
  whoBenefits,
}: {
  problem: string;
  whatYouSee: string;
  whoBenefits: string;
}) {
  return (
    <div className="page-story">
      <div>
        <h2 className="story-label">Problem</h2>
        <p>{problem}</p>
      </div>
      <div>
        <h2 className="story-label">What you see</h2>
        <p>{whatYouSee}</p>
      </div>
      <div>
        <h2 className="story-label">Who benefits</h2>
        <p>{whoBenefits}</p>
      </div>
    </div>
  );
}
