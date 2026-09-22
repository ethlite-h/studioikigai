import { cohortFromUrl } from "../router.js";

// /research — one responsive page for phone and desktop, linking to both instruments.
// The cohort query string is passed through so a shared link keeps its channel.
export function Landing() {
  const c = cohortFromUrl();
  const q = c ? `?c=${c}` : "";
  return (
    <div className="wrap research-page landing">
      <header className="landing-head">
        <p className="mono kicker">From one parent to another</p>
        <h1 className="h2 display">YouTube talks to our kids every day. <em>Let's be part of the conversation.</em></h1>
        <p className="lede">Hi! I'm Helen. I have three kids, 7 to 10, and every day people I've never met get to shape what they find funny, cool, and true. That concerns me the same way it probably concerns you. Before I build anything, I want to know whether other parents want what I want.</p>
      </header>

      <section className="landing-belief">
        <p className="body">Here's where I'm starting from, so you know what this isn't. Every tool on offer is a fence: YouTube Kids, Screen Time, blocking. <strong>Kids this age still care what their parents think, and that's worth more than any fence.</strong> And I'm not trying to get YouTube out of anyone's life. If you've tried the fences and watched them fail, you're exactly who I need to hear from.</p>
      </section>

      <div className="landing-cards">
        <a className="landing-card" href={`/research/parents${q}`}>
          <p className="mono small">Do this first · for you · about 10 minutes</p>
          <h2 className="h4">The parent survey</h2>
          <p className="body">A 10 minute survey on: what they watch, what you wish you knew, and honest reactions to five ideas. No email needed. Leave anything blank.</p>
          <span className="btn solid"><span>Start the survey</span><span className="arr">→</span></span>
        </a>
        <a className="landing-card" href={`/research/kids${q}`}>
          <p className="mono small">Then, if you're up for it · with your kid · about 15 minutes</p>
          <h2 className="h4">A conversation with your kid</h2>
          <p className="body">Not a form they fill in. You read twenty questions aloud on the couch and type what they say. Do the survey first: your answers give theirs their context. Best on a laptop or iPad. We never ask for their name, only their age.</p>
          <span className="btn"><span>Open the conversation</span><span className="arr">→</span></span>
        </a>
      </div>

      <section className="landing-notes">
        <h2 className="h4">What happens after</h2>
        <ul className="body">
          <li>A pilot with a few families, later this year. If you leave an email at the end of the survey, you'll be asked first.</li>
          <li>I'll write up what I learn and send it to everyone who took part, whether or not a product comes of it.</li>
          <li>Your answers are anonymous and go to one private database that only I can read. No analytics, no tracking, no third-party scripts on these pages. <strong>If you leave an email for the pilot, it's kept in a separate list that isn't tied to your answers.</strong></li>
          <li>If your kid does the conversation too, both forms ask for a family code. Make up any word and use it on both, so I can read your answers together.</li>
          <li>Questions? <a href="mailto:info@studioikigai.ai">info@studioikigai.ai</a></li>
        </ul>
      </section>
    </div>
  );
}
