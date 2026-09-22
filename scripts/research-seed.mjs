// Inserts 3 fake parent responses and 2 fake kid interviews, all cohort = "seed".
// Usage: DATABASE_URL=... node scripts/research-seed.mjs   (re-runnable: replaces earlier seed rows)
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set"); process.exit(1); }
const client = new pg.Client({ connectionString: url, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: true } });
await client.connect();

const parents = [
  {
    family_code: "pancake", email: "seed-one@example.com",
    answers: {
      p1: [9, 6], p2: 9, p3: ["iPad", "TV"], p4: "Full YouTube on a channel under my Google account", p5: "Yes", p6: "Yes",
      p7: "1–2 hours", p8: ["MrBeast", "Preston", ""], p9: "Somewhat", p10: "Yes, often", p11: "Asked them",
      p12: ["Screen Time limits", "Watching with them"], p13: "Screen Time: helped for a month, then they learned the passcode.\nWatching with them: still do it on Fridays.",
      p14: "A Mark Rober squirrel video.", p15: "know what they're watching", p16: "a weekly summary of their YouTube world",
      p17: "get your own stuff into their feed", p18: "That I don't know what it is", p19: ["understand", "know", "talk", "shape", "limit"],
      p20: "explain what they're laughing at", p21: "nothing",
      p22: { rating: 5, why: "This is exactly the gap." }, p23: { rating: 3, why: "Might work if they don't feel policed." },
      p24: { rating: 4, why: "I need the prompt, I never know what to ask." }, p25: { rating: 4, why: "We already sort of do this." },
      p26: { rating: 3, why: "Fair, but would they look?" }, p27: "more trustworthy", p28: "useful", p29: "Their side", p30: "A weekly note",
      p31: "Yes, if you walk me through it", p32: "Monthly at most", p33: "Only if I understood exactly what it reads",
      p34: ["Streaming", "Games or Roblox"], p35: "10 a month", p36: "yearly", p37: "40", p38: "Yes", p39: "",
    },
  },
  {
    family_code: "", email: null,
    answers: {
      p1: [11], p2: 11, p3: ["iPhone"], p4: "Full YouTube on their own supervised account", p5: "No", p6: "Not sure",
      p7: "More than 2 hours", p8: ["", "", ""], p9: "I'm guessing", p10: "Once or twice", p11: "Let it go",
      p12: ["YouTube Kids", "Taking the device away"], p13: "YouTube Kids: outgrew it at 8.\nTaking the device: works for a day.",
      p14: "Never", p15: "limit what they're watching", p16: "a live view of what they're watching right now",
      p17: "block the stuff you don't like", p18: "That it's taking time from other things", p19: ["limit", "know", "shape", "understand", "talk"],
      p20: "get them off it by dinner", p21: "their search history",
      p22: { rating: 3, why: "" }, p23: { rating: 2, why: "They'd ignore it." }, p24: { rating: 2, why: "" },
      p25: { rating: 3, why: "" }, p26: { rating: 1, why: "Why would I show them that?" }, p27: "less useful", p28: "not applicable",
      p29: "Ask about this", p30: "none", p31: "No", p32: "No, it has to be automatic", p33: "No",
      p34: ["Screen-time or safety apps"], p35: "5", p36: "monthly", p37: "no", p38: "No", p39: "Ask about school Chromebooks.",
    },
  },
  {
    family_code: "Waffle", email: "seed-three@example.com",
    answers: {
      p1: [7, 12, 14], p2: 7, p3: ["iPad", "Someone else's device"], p4: "YouTube Kids", p5: "Yes", p6: "No",
      p7: "30–60 min", p8: ["Blippi", "Ms Rachel", "Vlad and Niki"], p9: "Very", p10: "No", p11: "Other: nothing to do yet",
      p12: ["YouTube Kids", "Watching with them"], p13: "YouTube Kids: fine so far.\nWatching with them: every night, it's the routine.",
      p14: "A Blippi excavator episode, yesterday.", p15: "know what they're watching", p16: "a weekly summary of their YouTube world",
      p17: "get your own stuff into their feed", p18: "That I can't compete with it", p19: ["talk", "shape", "understand", "know", "limit"],
      p20: "steer them toward the good stuff without a fight", p21: "nothing, they're seven",
      p22: { rating: 4, why: "Would read it Sunday night." }, p23: { rating: 5, why: "This is the one." }, p24: { rating: 3, why: "" },
      p25: { rating: 5, why: "" }, p26: { rating: 4, why: "Good for when the older one uses it." }, p27: "both", p28: "useful",
      p29: "none", p30: "Add", p31: "Yes", p32: "Yes", p33: "Yes", p34: ["Streaming", "Learning apps"], p35: "$8", p36: "once", p37: "60", p38: "Yes",
      p39: "How the older sibling's stuff leaks down.",
    },
  },
];

const kids = [
  {
    family_code: "pancake", interviewer: "helen", child_age: 9,
    answers: {
      k1: "MrBeast (knew instantly), Preston, a Minecraft short. Scrolled for the third.", k2: "MrBeast. He gives people money and does challenges.",
      k3: "The one where he buries himself for 50 hours.", k4: "Sigma. Skibidi. Mom thinks skibidi is a toilet.", k5: "A friend",
      k6: "Some scary thumbnails. (Looked at mom first.)", k7: "Sometimes. Mark Rober with dad.",
      k8: "Cooking? Guitar stuff? (No real idea.)", k9: "Preston, so she'd stop calling him 'the loud one'.",
      k10: "fine", k11: "weird", k12: "That it's funny. Not that it's a waste of time.", k13: "Dad blocked it for a weekend. I watched on my friend's Switch.",
      k14: { choice: "good", said: "As long as it's not homework.", then: "Then that's sneaky. Bad." },
      k15: { choice: "dontcare", said: "She kind of already knows.", then: "Right now would be creepy." },
      k16: { choice: "good", said: "I'd send her the squirrel one!", then: "" },
      k17: { choice: "good", said: "Can it be tonight?", then: "" },
      k18: { choice: "good", said: "Better than blocking.", then: "Asked. Blocking makes me mad." },
      k19: { Lobby: { reaction: "Like a hotel? That's boring.", face: "flat, shrug" }, "Co-op": { reaction: "Like Minecraft co-op! Cool.", face: "eyebrows up, small grin" } },
      k20: "No ads.",
    },
  },
  {
    family_code: "waffle", interviewer: "parent", child_age: 7,
    answers: {
      k1: "Blippi, Blippi, Vlad and Niki. Knew instantly.", k2: "Blippi. He drives trucks.", k3: "The excavator one.", k4: "(Didn't understand the question.)",
      k5: "someone at home showed you", k6: "No.", k7: "Yes, every night with mommy.",
      k8: "(Blank. Shrugged.)", k9: "(Blank.)", k10: "fine", k11: "fine", k12: "That she likes it too.", k13: "No.",
      k14: { choice: "good", said: "Is it a truck video?", then: "(Didn't follow.)" },
      k15: { choice: "dontcare", said: "Okay.", then: "(Skipped.)" },
      k16: { choice: "good", said: "I'd give her the excavator!", then: "" },
      k17: { choice: "good", said: "Tonight?", then: "" },
      k18: { choice: "dontcare", said: "(Skipped, didn't parse.)", then: "" },
      k19: { Lobby: { reaction: "What's a lobby?", face: "confused" }, "Co-op": { reaction: "Chicken coop!", face: "laughing" } },
      k20: "More Blippi.",
    },
  },
];

await client.query("delete from responses where cohort = 'seed'");
for (const p of parents) {
  await client.query(
    "insert into responses (instrument, cohort, family_code, status, completed_at, answers, email) values ('parents','seed',$1,'complete',now(),$2,$3)",
    [p.family_code, JSON.stringify(p.answers), p.email],
  );
}
for (const k of kids) {
  await client.query(
    "insert into responses (instrument, cohort, family_code, status, completed_at, answers, interviewer, child_age, consent) values ('kids','seed',$1,'complete',now(),$2,$3,$4,true)",
    [k.family_code, JSON.stringify(k.answers), k.interviewer, k.child_age],
  );
}
// one in-progress kid interview so the dashboard's draft count is exercised
await client.query(
  "insert into responses (instrument, cohort, family_code, status, answers, interviewer, child_age, consent) values ('kids','seed','','draft',$1,'parent',11,true)",
  [JSON.stringify({ k1: "Skibidi toilet compilation, a Roblox stream, something with cats.", k2: "KreekCraft. Roblox." })],
);
await client.end();
console.log("seeded 3 parent responses, 2 kid interviews, 1 kid draft (cohort = seed)");
