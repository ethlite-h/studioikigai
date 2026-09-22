import { cohortFromUrl } from "../router.js";

// Shown after either form. Offers the kid conversation after the parent survey,
// and always a way back to the research page. Never the studio home page.
export function Thanks() {
  const from = window.history.state?.from || "parents";
  const c = cohortFromUrl();
  const q = c ? `?c=${c}` : "";
  return (
    <div className="wrap research-page narrow">
      <p className="mono kicker">Thank you</p>
      <h1 className="h3 display">That's it. Thank you.</h1>
      <p className="body">Your answers are saved and anonymous. If you left an email, it's kept apart from your answers, and Helen will be in touch about the pilot, and only about that.</p>
      {from === "parents" ? (
        <>
          <p className="body">If your kid is around and up for it, the second half is a fifteen-minute conversation you have with them. You read the questions aloud and type what they say. Best on a laptop or iPad.</p>
          <div className="form-nav start">
            <a className="btn solid" href={`/research/kids${q}`}><span>Do the conversation with your kid</span><span className="arr">→</span></a>
            <a className="btn ghost" href={`/research${q}`}><span>Back to the research page</span></a>
          </div>
        </>
      ) : (
        <div className="form-nav start">
          <a className="btn ghost" href={`/research${q}`}><span>Back to the research page</span></a>
        </div>
      )}
    </div>
  );
}
