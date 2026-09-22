// Lobby discovery research: both instruments as data.
// Source of truth: content/surveys/parent-survey.md and content/surveys/kid-interview.md.
// Prompts, helper notes and options are transcribed verbatim from those files.
// The forms, the API validation and the dashboard all render from this file;
// adding or editing a question must not require touching UI code.
//
// Answer types
//   single        one option (radio)                  answer: string
//   multi         several options (checkboxes)        answer: string[]   (`max` limits picks)
//   scale         1–5                                 answer: { rating: number, why: string }  (when `why` is set)
//   rank          order `items` most → least          answer: string[] of item ids, first = most important
//   short         one line                            answer: string, or string[] when `repeat` > 1
//   long          paragraph                           answer: string
//   number        integer                             answer: number
//   kids-roster   repeatable age fields               answer: number[] (one age per kid)
//   gbd           good / bad / don't care             answer: { choice: 'good'|'bad'|'dontcare'|'', said: string, then: string }
// `other: true` on an option adds a free-text field; the answer is then "Other: <text>".

const GBD_OPTIONS = [
  { id: "good", label: "good" },
  { id: "bad", label: "bad" },
  { id: "dontcare", label: "don't care" },
];

export const GBD = GBD_OPTIONS;

const FIVE_IDEAS = [
  "A weekly note",
  "Add",
  "Ask about this",
  "Watch together",
  "Their side",
];

export const PARENTS = {
  id: "parents",
  title: "Parent survey",
  intro:
    "A written survey for parents, about 10 minutes. It's part of a small piece of research into how parents of 7–12-year-olds see their kid's YouTube world. Nothing here is a pitch, and nothing you write is shared.",
  sections: [
    {
      id: "family",
      n: 1,
      title: "About your family",
      questions: [
        { id: "p1", n: 1, type: "kids-roster", prompt: "How many kids do you have between 5 and 14? For each, their age." },
        { id: "p2", n: 2, type: "number", min: 5, max: 14, prompt: "Which one are you thinking of most when you answer this survey? (Age.)", help: "Answer the rest for that kid." },
        { id: "p3", n: 3, type: "multi", max: 2, prompt: "Where do they mostly watch YouTube? (Pick up to two.)", options: ["iPad", "iPhone", "TV", "Mac or laptop", "Someone else's device", "School Chromebook"] },
        { id: "p4", n: 4, type: "single", prompt: "Which YouTube are they on?", options: ["Full YouTube on a channel under my Google account", "Full YouTube on their own supervised account", "Full YouTube, logged out", "YouTube Kids", "Not sure"] },
        { id: "p5", n: 5, type: "single", prompt: "Do you have a Mac at home you use regularly?", options: ["Yes", "No"] },
        { id: "p6", n: 6, type: "single", prompt: "Do you use Apple Family Sharing?", options: ["Yes", "No", "Not sure"] },
      ],
    },
    {
      id: "today",
      n: 2,
      title: "YouTube today",
      questions: [
        { id: "p7", n: 7, type: "single", prompt: "Roughly how much YouTube do they watch on a school day?", options: ["Under 30 min", "30–60 min", "1–2 hours", "More than 2 hours", "No idea"] },
        { id: "p8", n: 8, type: "short", repeat: 3, prompt: "Name up to three channels or creators they watch most.", help: "(Leave blank if you can't.)" },
        { id: "p9", n: 9, type: "single", prompt: "How confident are you that the list above is right?", options: ["Very", "Somewhat", "I'm guessing"] },
        { id: "p10", n: 10, type: "single", prompt: "In the last month, has your kid said or done something from YouTube you didn't understand? (A phrase, a joke, a dance, a reference.)", options: ["Yes, often", "Once or twice", "No"] },
        { id: "p11", n: 11, type: "single", prompt: "What did you do about it?", options: ["Asked them", "Looked it up", "Asked another parent", "Let it go", { label: "Other", other: true }] },
        { id: "p12", n: 12, type: "multi", prompt: "Have you tried any of these? (Pick all.)", options: ["YouTube Kids", "Supervised account settings", "Screen Time limits", "Blocking specific channels", "Taking the device away", "Watching with them", "None"] },
        { id: "p13", n: 13, type: "long", prompt: "For each one you tried: did it help, and did it last?", help: "(Free text, one line each.)" },
        { id: "p14", n: 14, type: "long", prompt: "What's the last video or creator you watched together on purpose?", help: "(Free text. \"Never\" is a fine answer.)" },
      ],
    },
    {
      id: "want",
      n: 3,
      title: "What you actually want",
      note: "These are forced choices on purpose. Pick the one closer to you even if neither is exact.",
      questions: [
        { id: "p15", n: 15, type: "single", prompt: "If you could have only one:", options: ["know what they're watching", "limit what they're watching"] },
        { id: "p16", n: 16, type: "single", prompt: "If you could have only one:", options: ["a weekly summary of their YouTube world", "a live view of what they're watching right now"] },
        { id: "p17", n: 17, type: "single", prompt: "If you could have only one:", options: ["block the stuff you don't like", "get your own stuff into their feed"] },
        { id: "p18", n: 18, type: "single", prompt: "When your kid watches something you think is junk, what bothers you most?", options: ["That they're watching it at all", "That I don't know what it is", "That I can't compete with it", "That it's taking time from other things"] },
        {
          id: "p19", n: 19, type: "rank", prompt: "Rank these from most to least important to you:",
          items: [
            { id: "know", label: "knowing what they watch" },
            { id: "understand", label: "understanding what it means" },
            { id: "shape", label: "shaping what they see" },
            { id: "limit", label: "limiting how much they watch" },
            { id: "talk", label: "having things to talk about with them" },
          ],
        },
        { id: "p20", n: 20, type: "long", prompt: "Complete the sentence: \"I'd feel like I was doing my job if I could ___.\"", help: "(Free text.)" },
        { id: "p21", n: 21, type: "long", prompt: "Complete the sentence: \"The thing I'd never want my kid to find out I could see is ___.\"", help: "(Free text; \"nothing\" is allowed.)" },
      ],
    },
    {
      id: "ideas",
      n: 4,
      title: "Reactions to five ideas",
      note: "Rate each 1–5 (1 = wouldn't use, 5 = I'd use this every week), then one line on why.",
      questions: [
        { id: "p22", n: 22, type: "scale", why: true, label: "A weekly note", prompt: "A weekly note about your kid's YouTube: the five or six creators that were most of their week and what each one is, the memes explained, what changed since last week, and two questions you could ask. You see creators and topics, not a video-by-video list." },
        { id: "p23", n: 23, type: "scale", why: true, label: "Add", prompt: "Add: you subscribe their channel to a creator you like, or put a video in their Watch Later, and it shows up in their normal YouTube. They know it came from you." },
        { id: "p24", n: 24, type: "scale", why: true, label: "Ask about this", prompt: "Ask about this: you tap a creator or a meme and it becomes a conversation prompt, not a block. There is no block." },
        { id: "p25", n: 25, type: "scale", why: true, label: "Watch together", prompt: "Watch together: either of you flags a video, and it becomes a thing to do tonight." },
        { id: "p26", n: 26, type: "scale", why: true, label: "Their side", prompt: "Their side: your kid can see which of your channels and interests you've shared, and a plain-language screen of what you can and can't see about them." },
        { id: "p27", n: 27, type: "single", prompt: "The weekly note arrives a week behind, never live, and never sends notifications. Does that make it:", options: ["more trustworthy", "less useful", "both", "doesn't matter"] },
        { id: "p28", n: 28, type: "single", prompt: "If the note showed you which channels came to your younger kid via an older sibling, would that be:", options: ["useful", "none of my business", "not applicable"] },
        { id: "p29", n: 29, type: "single", prompt: "Which of the five ideas would you delete without missing it? (Pick one or \"none.\")", options: [...FIVE_IDEAS, "none"] },
        { id: "p30", n: 30, type: "single", prompt: "Which one would you pay for on its own? (Pick one or \"none.\")", options: [...FIVE_IDEAS, "none"] },
      ],
    },
    {
      id: "logistics",
      n: 5,
      title: "Logistics and price",
      questions: [
        { id: "p31", n: 31, type: "single", prompt: "To set this up, you'd export your kid's YouTube history once from Google (about five minutes, on a computer). Would you do that?", options: ["Yes", "Yes, if you walk me through it", "No"] },
        { id: "p32", n: 32, type: "single", prompt: "Would you do it again each week to keep the note current?", options: ["Yes", "Monthly at most", "No, it has to be automatic"] },
        { id: "p33", n: 33, type: "single", prompt: "If keeping it current meant leaving a Mac app signed in to your Google account, would you?", options: ["Yes", "Only if I understood exactly what it reads", "No"] },
        { id: "p34", n: 34, type: "multi", prompt: "What do you currently pay for, per month, that's for your kids? (Pick all.)", options: ["Streaming", "Games or Roblox", "Learning apps", "Screen-time or safety apps", "Nothing"] },
        { id: "p35", n: 35, type: "short", prompt: "What does a parental-control or safety app cost, in your head?", help: "(Free text, a number.)" },
        { id: "p36", n: 36, type: "single", prompt: "Would you rather pay:", options: ["monthly", "yearly", "once"] },
        { id: "p37", n: 37, type: "short", prompt: "Is there a price per year at which this would feel like an obvious yes?", help: "(A number, or \"no.\")" },
        { id: "p38", n: 38, type: "single", prompt: "Would you let me talk to your kid for fifteen minutes about YouTube, with you in the room?", options: ["Yes", "No"] },
        { id: "p39", n: 39, type: "long", prompt: "Anything I didn't ask that I should have?" },
      ],
    },
  ],
  // "What each question tests", verbatim. `compute` names a tally the dashboard
  // can turn into holds / at risk; where the threshold isn't numeric there is none.
  decisions: [
    { questions: ["p3", "p4", "p5"], decision: "Brand accounts and Mac companion as the data path", threshold: "Under half on brand accounts or under half with a Mac: the iOS Takeout import is the primary path, not the fallback", compute: "brand-and-mac" },
    { questions: ["p8", "p9"], decision: "The Edition's core value: parents don't know the creators", threshold: "If most parents name the top three confidently, the Edition needs to lead with meaning, not identity", compute: "confident-naming" },
    { questions: ["p10", "p11"], decision: "The translation job is real", threshold: "Few \"yes, often\": the glossary is secondary; lead with creators and presence" },
    { questions: ["p12", "p13"], decision: "Why prior tools failed", threshold: "If \"watching with them\" is the one thing that lasted, watch-together moves up" },
    { questions: ["p15", "p16", "p17", "p18", "p19"], decision: "Control vs understanding vs presence", threshold: "If \"limit\" and \"block\" win the forced choices, the demand is for a control app; the add-never-remove rule is a niche, not the market", compute: "limit-and-block" },
    { questions: ["p20", "p21"], decision: "What parents feel is their job, and where surveillance starts for them", threshold: "Q21 answers name the line the parent view must not cross" },
    { questions: ["p22", "p23", "p24", "p25", "p26", "p29", "p30"], decision: "Each surface's standalone worth", threshold: "The idea most would delete is cut from v1; the one most would pay for on its own is the launch pitch" },
    { questions: ["p27"], decision: "Delay as the privacy setting", threshold: "Majority \"less useful\": the delay is a real cost, revisit cadence", compute: "majority", of: "p27", value: "less useful" },
    { questions: ["p28"], decision: "Sibling reporting", threshold: "Majority \"none of my business\": drop it", compute: "majority", of: "p28", value: "none of my business" },
    { questions: ["p31", "p32", "p33"], decision: "Takeout friction and the Mac's signed-in path", threshold: "Weekly re-export refused by most: the automated Mac path is load-bearing, not optional", compute: "weekly-refused" },
    { questions: ["p34", "p35", "p36", "p37"], decision: "Price anchor", threshold: "Q35 sets the ceiling parents already have in their head; Q37 gives the yearly number" },
  ],
  footnote: "The survey never asks \"would you buy this.\" Q30 and Q37 are as close as it gets, and the pilot is the real answer.",
};

export const KIDS = {
  id: "kids",
  title: "Kid interview (7–12)",
  intro:
    "A 15-minute conversation, run by a parent or by Helen, with the questions read aloud. The answers tell us whether the parent product's presence in a kid's YouTube will be tolerated, welcomed, or routed around.",
  howTo: {
    title: "How to run it",
    body: "This is a conversation, not a form. A 7-year-old can't fill in a survey and a 10-year-old will fill it in to please whoever is watching, so the questions are read aloud and answers are written down by the adult. Fifteen minutes, on the couch, with the iPad nearby so they can show you things.",
    rules: [
      "Best run by Helen with the parent in the room but quiet. Second best: the parent alone, reading the questions as written.",
      "Start with the iPad open. \"Show me\" gets truer answers than \"tell me.\"",
      "Write down their words, not a summary. \"It's so skibidi\" is data.",
      "No follow-ups that start with \"why.\" Use \"what happens then?\" or \"show me one.\"",
      "Skip anything they don't understand; don't explain it. A question a 7-year-old can't parse tells you the feature needs no words.",
      "Never react to a channel or a video. A raised eyebrow ends the interview even if it keeps going.",
    ],
  },
  sections: [
    {
      id: "their-youtube",
      n: 1,
      title: "Part 1 — Their YouTube (5 minutes)",
      questions: [
        { id: "k1", n: 1, type: "long", prompt: "Show me the last three things you watched.", help: "(Write the channels. Note whether they scroll to find them or know instantly.)" },
        { id: "k2", n: 2, type: "long", prompt: "Who's your favorite YouTuber right now? What do they do?" },
        { id: "k3", n: 3, type: "long", prompt: "If a new kid came to your school and had never seen YouTube, what's the first video you'd show them?" },
        { id: "k4", n: 4, type: "long", prompt: "What's something from YouTube that you say, or do, that grown-ups don't get?" },
        { id: "k5", n: 5, type: "single", prompt: "Where did you find your favorite YouTuber?", options: ["A friend", "your brother or sister", "it just showed up", "someone at home showed you", "don't remember"] },
        { id: "k6", n: 6, type: "long", prompt: "Is there anything on YouTube you've seen that you didn't like?", help: "(Don't push. \"No\" is fine. Note whether they look at the parent before answering.)" },
        { id: "k7", n: 7, type: "long", prompt: "Do you ever watch YouTube with your mom or dad? What do you watch together?" },
      ],
    },
    {
      id: "where-parents-fit",
      n: 2,
      title: "Part 2 — Where parents fit (5 minutes)",
      questions: [
        { id: "k8", n: 8, type: "long", prompt: "What do you think your mom or dad watches on YouTube?", help: "(Note whether they have any idea. This is the \"Mom watches this\" test in reverse.)" },
        { id: "k9", n: 9, type: "long", prompt: "Is there a YouTuber you wish your parents knew about, so they'd get it when you talk about them?" },
        { id: "k10", n: 10, type: "single", prompt: "If your parents knew every channel you watch — not every video, just the channels — would that be:", options: ["fine", "weird", "I'd stop watching some of them"] },
        { id: "k11", n: 11, type: "single", prompt: "What about if they could see every single video?", options: ["fine", "weird", "I'd stop watching some of them"] },
        { id: "k12", n: 12, type: "long", prompt: "If your mom found out about your favorite YouTuber and said something about it, what would you want her to say?", help: "(Free. Note whether they want to be understood or left alone.)" },
        { id: "k13", n: 13, type: "long", prompt: "Has a grown-up ever taken YouTube away or blocked something? What happened after?", help: "(Write the sequence. \"I used my cousin's iPad\" is the answer we're looking for.)" },
      ],
    },
    {
      id: "try-these",
      n: 3,
      title: "Part 3 — Try these on them (5 minutes)",
      note: "Say each one plainly, then ask \"good, bad, or don't care?\" and write down the first thing they say after that.",
      questions: [
        { id: "k14", n: 14, type: "gbd", prompt: "\"Your dad could put a video in your YouTube. It would say it's from him. You don't have to watch it.\"", then: "\"What if it didn't say it was from him?\"" },
        { id: "k15", n: 15, type: "gbd", prompt: "\"Your mom could see the channels you watch, but only once a week, and never what you're watching right now.\"", then: "\"Would once a week feel different from right now?\"" },
        { id: "k16", n: 16, type: "gbd", prompt: "\"You could put a video in your mom's YouTube, and it would say it's from you.\"", help: "(This is the presence test flipped. If it lands, the two-way window is real.)" },
        { id: "k17", n: 17, type: "gbd", prompt: "\"You and your dad could both mark a video as one to watch together tonight.\"" },
        { id: "k18", n: 18, type: "gbd", prompt: "\"A grown-up could tap a video and ask you about it instead of blocking it.\"", then: "\"Would you rather they blocked it or asked about it?\"" },
        { id: "k19", n: 19, type: "long", prompt: "What would you call this app?" },
        { id: "k20", n: 20, type: "long", prompt: "Last one: \"If you could change one thing about YouTube, what would it be?\"" },
      ],
    },
  ],
  decisions: [
    { questions: ["k1", "k2", "k3"], decision: "Whether creators are the unit", threshold: "Kids who name channels, not videos, confirm creators-not-videos in the parent view" },
    { questions: ["k4", "k9"], decision: "Whether the translation job exists on the kid's side too", threshold: "Kids who want parents to \"get it\" are allies of the Edition; the glossary earns its place" },
    { questions: ["k5"], decision: "Sibling and peer influence vs the algorithm", threshold: "Mostly \"friend\" or \"sibling\": the sibling report matters and the Add path competes with peers, not YouTube", compute: "majority-any", of: "k5", values: ["A friend", "your brother or sister"] },
    { questions: ["k6", "k13"], decision: "Routing-around behavior", threshold: "Any \"cousin's iPad\" story is evidence against control features and for presence" },
    { questions: ["k7", "k17"], decision: "Watch-together as a first-class action", threshold: "If they can't remember ever doing it, watch-together is the easiest win in the product" },
    { questions: ["k8", "k16"], decision: "The two-way window", threshold: "Blank on Q8 and \"good\" on Q16: a kid's own Add to the parent's feed is worth building", compute: "blank8-good16" },
    { questions: ["k10", "k11", "k15"], decision: "Creators-only and weekly delay as the privacy line", threshold: "\"I'd stop watching some\" on channels means even the creator view is too much for that age; \"weird\" on videos and \"fine\" on channels confirms the line" },
    { questions: ["k14"], decision: "Attribution", threshold: "\"Bad\" when the note is removed confirms the disclosure rule; \"don't care\" either way means attribution is for the parent, not the kid" },
    { questions: ["k18"], decision: "Ask-about-this vs blocking", threshold: "Kids who prefer the block are telling you the conversation costs them more than the loss" },
  ],
  footnote: "Run it with at least four kids at each end of the range. A 7-year-old's answers and a 10-year-old's won't agree, and the features that survive both are the ones to build first.",
};

export const INSTRUMENTS = { parents: PARENTS, kids: KIDS };

// Mirrored questions, joined in the Households view.
export const MIRRORS = [
  { parent: ["p26", "p27"], kid: ["k10", "k11", "k15"], label: "What the parent may see, and the weekly delay" },
  { parent: ["p23"], kid: ["k14"], label: "Add, with attribution" },
];

// Age bands for the kids dashboard. Ages outside every band are shown raw.
export const AGE_BANDS = [
  { id: "7-8", label: "7–8", min: 7, max: 8 },
  { id: "9-10", label: "9–10", min: 9, max: 10 },
  { id: "11-12", label: "11–12", min: 11, max: 12 },
];

export const INTERVIEWERS = [
  { id: "helen", label: "Helen" },
  { id: "parent", label: "A parent" },
];

export function allQuestions(instrument) {
  return instrument.sections.flatMap((s) => s.questions);
}

export function questionById(instrument, id) {
  return allQuestions(instrument).find((q) => q.id === id);
}

export function optionLabel(opt) {
  return typeof opt === "string" ? opt : opt.label;
}

export const MIN_N = 8; // below this a computed decision reads "too few responses"
