import { Reveal, Words } from "../lib/Reveal.jsx";

const TENETS = [
  ["The market was never too small.", "It was too small for them. Ten thousand people who care is a business, a community, and a reason to get up. We size products for the people who'll love them, not for a slide."],
  ["On-device, or it doesn't ship.", "The models that read your feed or judge your voice run on your hardware. What syncs, syncs through your own iCloud. Nothing about you sits with us."],
  ["Show the model. Hand over the keys.", "Every model we build of you, your interests, your voice, your attention, is visible, editable, exportable and deletable. It's yours."],
  ["Expression over performance.", "We don't optimise for engagement or vocal perfection. We build tools that help you be more yourself, and then get out of the way."],
  ["Customers, not investors.", "No board. No growth targets that never stop. A way to make a living by serving real needs without anyone's permission."],
  ["The mammals never needed the dinosaurs to die.", "They just needed room to breathe. Broadcasting is still with us. So is big tech. We build in the space it leaves behind."],
];

export function Manifesto() {
  return (
    <section id="manifesto" className="section lower" aria-labelledby="manifesto-h">
      <div className="wrap">
        <Reveal><p className="mono kicker">Six tenets</p></Reveal>
        <Reveal delay={0.05} style={{ marginTop: 22, marginBottom: 48 }}>
          <h2 id="manifesto-h" className="display h2" style={{ maxWidth: "14ch" }}><Words text="Software for" /> <em>humans,</em> <Words text="written down." /></h2>
        </Reveal>
        <ol className="tenets">
          {TENETS.map(([h, p], i) => (
            <Reveal as="li" key={h} delay={0.05 * i}>
              <h3>{h}</h3>
              <p>{p}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
