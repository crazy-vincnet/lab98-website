/**
 * English site content — same exports/shapes as content.ts (Korean).
 * Owner: English translation agents. Search `TODO(en)` for what is still Korean fallback.
 * Pick the dictionary with getContent(locale) from "@/lib/get-content".
 *
 * Rules: keep slugs, hrefs, URLs, image paths, ids and numbers identical to content.ts; only translate prose.
 * Do not import this file from client components (use the page's props); it is server-side data.
 */
import {
  divisions as koDivisions,
  notes as koNotes,
  projects as koProjects,
  nav as koNav,
  site as koSite,
  type Division,
  type DivisionInfo,
  type DivisionSlug,
  type Faq,
  type FaqKey,
  type NavItem,
  type Note,
  type Project,
  type SiteInfo,
} from "@/lib/content";

export const site: SiteInfo = {
  ...koSite,
  slogan: "Technology is the tool. People are the point.",
  sloganLines: ["Technology is the tool.", "People are the point."],
  sloganEn: koSite.sloganEn,
  sloganOriginal: "Technology should make life easier for people! Technology is not the master — it is just a tool.",
  description:
    "Lab98 builds websites, online stores and Mac/Windows software (Dev), teaches AI and runs an AI community (AI), and makes software for churches and mission organizations (Faith). We make easy-to-use tools so people can focus on what matters more.",
  replyTime: "We reply within 2 business days",
  founder: { ...koSite.founder, name: "Vincent Jeon", nameEn: "Vincent Jeon", display: "Vincent Jeon" },
  nameMeaning: "The 98 in Lab98 is the year our founder, Vincent Jeon, was born: 1998.",
  business: {
    ...koSite.business,
    name: "JJdream (제이제이드림)",
    representative: "Vincent Jeon (전영재)",
  },
};

export const nav: readonly NavItem[] = [
  { label: "About", href: koNav[0].href },
  { label: "Services", href: koNav[1].href },
  { label: "Projects", href: koNav[2].href },
  { label: "Praise Tool", href: koNav[3].href },
  { label: "Insights", href: koNav[4].href },
  { label: "Contact", href: koNav[5].href },
];

/** Per-division English overrides (names, slugs and CTA interests stay identical to Korean). */
const divisionEn: Record<DivisionSlug, Partial<DivisionInfo>> = {
  dev: {
    role: "Web & software development",
    headline: "Custom websites and software, built from scratch",
    summary:
      "We build company websites, online stores and Mac/Windows software as custom work, with no templates. When we launch, we hand over the source code too.",
    description:
      "Every project is designed from scratch around how you work. We define the problem together in a meeting, confirm the design with mockups, then build. You get the source code at launch, so you are never stuck wherever you manage it later.",
    services: [
      { title: "Company websites", body: "Websites that introduce your company or organization and take inquiries, donations and applications. We handle planning, design and development." },
      { title: "Online stores", body: "From product pages to orders, a store built around how you run your business." },
      { title: "Mac & Windows software", body: "Desktop software for Mac and Windows that takes repetitive work off your hands." },
    ],
    process: [
      { title: "Meeting", body: "We go over the problem you want to solve, your goals and your schedule." },
      { title: "Mockups", body: "We show you the screens and structure first, then settle the direction." },
      { title: "Build", body: "We build the real thing from the approved mockups." },
      { title: "Revisions", body: "You try it out, and we fix what needs fixing." },
      { title: "Launch & code handover", body: "We hand over the source code at launch." },
      { title: "Wrap-up", body: "We walk you through how to run it." },
    ],
    facts: [
      { label: "Starting price", value: "From KRW 2M" },
      { label: "Approach", value: "100% custom" },
      { label: "Deliverable", value: "Source code included" },
    ],
    cta: { label: "Ask about a Dev project", interest: "dev" },
  },
  ai: {
    role: "AI training & community",
    headline: "Tried AI but not sure where to go next?",
    summary:
      "We teach you how to use AI properly, through online and in-person classes and training for schools and companies. We are also building a community platform where you can keep learning together.",
    description:
      "AI is a useful tool, but many people find it hard to approach, or try it a few times and stop. That is why we started Lab98 AI. It is a proper AI training program. AI does not replace people. We help people use AI well as a tool.",
    services: [
      { title: "Online & in-person classes", body: "Classes matched to your level, from people just starting out to people who want to use AI at work right away." },
      { title: "School training", body: "Training that helps students and teachers use AI correctly and well." },
      { title: "Company training", body: "We use your team's real work as examples, so you can use AI from the next day." },
      { title: "AI community platform", body: "We are building our own community platform where you can ask questions and share what you learned." },
    ],
    process: [
      { title: "Training inquiry", body: "Tell us who the training is for, how many people and what topics you want." },
      { title: "Custom plan", body: "We propose a curriculum that fits your level and goals." },
      { title: "Training", body: "Hands-on training, online or in person." },
      { title: "Community", body: "After the training, you can keep asking and sharing in the community." },
    ],
    facts: [
      { label: "Format", value: "Online · In person" },
      { label: "For", value: "Individuals · Schools · Companies" },
      { label: "Community", value: "Opening soon" },
    ],
    cta: { label: "Ask about AI training", interest: "ai" },
    status: { label: "Opening soon", body: "We are building the Lab98 AI community platform. We will tell you first when it opens." },
  },
  faith: {
    role: "Software for churches & missions",
    headline: "Software for your ministry, built and run with you",
    summary:
      "We build, distribute and run software for churches, mission organizations and Christians. Our first product is Praise Tool, a program for worship lyrics and media output.",
    description:
      "Ministry has a lot of work that repeats every week. With tools that take some of it off your hands, you can focus more on people. Lab98 Faith builds software that churches and mission organizations actually use, and keeps running and updating it after release.",
    services: [
      { title: "Worship & ministry software", body: "Software used every week on site, such as worship output and ministry management." },
      { title: "Distribution & operations", body: "We stay with you after release, from installation to updates and troubleshooting." },
      { title: "Custom software", body: "We listen to what your church or organization really needs, then build software for it." },
    ],
    process: [
      { title: "Listening", body: "We hear about the repeated tasks and pain points in your ministry." },
      { title: "Build", body: "We make software you can use on site right away." },
      { title: "Distribution", body: "We release it so it is easy to install and use on Mac and Windows." },
      { title: "Operations", body: "We stay with you through updates and support." },
    ],
    facts: [
      { label: "For", value: "Churches · Mission organizations · Christians" },
      { label: "First product", value: "Praise Tool" },
      { label: "Launch", value: "2026. 11. 11" },
    ],
    cta: { label: "Ask about Faith software", interest: "faith" },
  },
};

export const divisions: DivisionInfo[] = koDivisions.map((d) => ({ ...d, ...divisionEn[d.slug] }));

export function getDivision(slug: string) {
  return divisions.find((d) => d.slug === slug);
}

const SCOPE_EN = "Planning · Design · Development";
const languageEn: Record<string, string> = { 한국어: "Korean", English: "English" };

const projectEn: Record<string, Pick<Project, "title" | "summary" | "highlights">> = {
  nkhb: {
    title: "NKHB website (New Korea Hope Broadcasting)",
    summary: "A radio broadcast for North Korea that brings the truth, hope and the gospel to people there over the airwaves.",
    highlights: [
      { title: "Listen on the web", body: "Visitors can play today's broadcast on the site, and an intro video explains the background of the broadcast." },
      { title: "Letters of hope", body: "Visitors write letters of hope on the site to send to people in North Korea." },
      { title: "Giving options", body: "Visitors choose a monthly donation amount or fund broadcast production in units from 30 minutes to one month, so it is clear how to take part." },
      { title: "Broadcast times & frequencies", body: "The program lineup, expected impact, broadcast times and frequencies are laid out in one view." },
    ],
  },
  nkfi: {
    title: "NKFI · New Korea Foundation International website",
    summary: "An international NGO that works for the recovery of North Korean refugees and prepares for a unified Korea.",
    highlights: [
      { title: "Four core ministries", body: "Mobilizing, training, networking and relief: the four ministries are laid out so they are easy to understand at a glance." },
      { title: "News board & newsletter", body: "An NKFI news board and newsletter signup keep the organization in regular contact with supporters." },
      { title: "Giving in Korea and abroad", body: "Domestic, international and online giving are explained separately, with contact details for the Korea and US offices." },
      { title: "Korean & English", body: "The site runs in Korean and English, as an international NGO needs." },
    ],
  },
  pbf: {
    title: "Provision Bridge Fund website",
    summary: "A fund that connects supporters and missionaries so missionaries can focus on their work without worrying about insurance.",
    highlights: [
      { title: "Giving applications", body: "Matched or designated giving and regular giving can be applied for directly on the site." },
      { title: "Insurance support applications & status lookup", body: "Missionaries apply for insurance support and check the progress of their application themselves." },
      { title: "Legal consent process", body: "Consent for handling personal and sensitive information and for sharing with third parties is built into the process as required." },
      { title: "FAQ & resources", body: "The site has frequently asked questions, an explanation of how funds are managed and a downloadable PDF pamphlet." },
    ],
  },
  pray4nk: {
    title: "Pray4NK · Nehemiah 1 Million Prayer Signatures website",
    summary: "A Nehemiah 1 Million Prayer Signatures movement for North Korea. People in 81 countries are praying together.",
    highlights: [
      { title: "Online prayer signature", body: "A prayer signature takes 30 seconds, and a live signature count encourages people to take part." },
      { title: "Prayer map", body: "A map shows people praying together around the world." },
      { title: "Monthly prayer topics", body: "A new prayer topic is posted every month, and past topics are kept in one place." },
      { title: "Prayer letter subscription", body: "A monthly prayer letter keeps subscribers connected with others who pray." },
    ],
  },
  befriends: {
    title: "BeFriends website",
    summary: "A social integration platform that helps people from South and North Korea understand each other and become friends.",
    highlights: [
      { title: "Program pages", body: "The BeFriends workshop, the Dagachi project and the two-day overnight program each have their own page." },
      { title: "News by program", body: "Each program has its own news board." },
      { title: "Inquiries by type", body: "Program, partnership and donation inquiries are received separately by type." },
      { title: "Workshop registration", body: "Workshop registration is taken directly on the site." },
    ],
  },
};

export const projects: Project[] = koProjects.map((p) => ({
  ...p,
  ...projectEn[p.slug],
  type: "Website",
  scope: SCOPE_EN,
  languages: p.languages?.map((l) => languageEn[l] ?? l),
}));

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export const clients = projects.map((p) => ({ name: p.clientEn ? `${p.client} (${p.clientEn})` : p.client, short: p.clientEn ?? p.client, url: p.url }));

/** English posts keep the Korean post's slug, date, division and reading time; only the prose is translated. */
const noteEn: Record<string, Pick<Note, "title" | "excerpt" | "body">> = {
  "starting-lab98": {
    title: "Technology is a tool, not the boss: Why I started Lab98",
    excerpt: "Why I started Lab98, what its three divisions (Dev, AI and Faith) do, and where we want to go.",
    body: [
      { type: "p", text: "Hi, I'm Vincent Jeon, the person who started Lab98. This is our first post, so I'll begin with how we think about our work." },
      { type: "h2", text: "Technology should make life easier" },
      { type: "p", text: "Lab98's slogan is one sentence." },
      { type: "quote", text: "Technology should make life easier for people! Technology is not the master — it is just a tool." },
      { type: "p", text: "In software, I often see technology become the goal. People change how they work just to use a new tool. A complicated system ends up keeping them busier than before. I think it should be the other way around. Technology should take work off people's hands and let them focus on what matters more." },
      { type: "p", text: "So before asking \"what can we build?\", Lab98 asks \"will the people using this have an easier time?\"" },
      { type: "h2", text: "The 98 in the name" },
      { type: "p", text: "The 98 in Lab98 is the year I was born, 1998. I didn't want to give it a grand meaning. I wanted to say that I put my own name behind this work. It's a promise to stand behind everything we deliver." },
      { type: "h2", text: "Three things Lab98 does" },
      { type: "p", text: "Lab98 works through three divisions. The fields differ, but the test is the same. Does the technology help people?" },
      { type: "h3", text: "1. Lab98 Dev: Websites and software" },
      { type: "p", text: "We build company websites, online stores, and Mac and Windows software. Everything is custom-made from scratch for the client, with no templates. This is how a project goes." },
      {
        type: "olist",
        items: [
          "Meeting: We work out the problem you want to solve and your goals together.",
          "Mockup: We show you the screens and structure first.",
          "Build: We build the real thing from the approved mockup.",
          "Revisions: You try it out, and we fix what needs fixing.",
          "Launch and code handover: We open the site and hand over the source code.",
          "Wrap-up: We walk you through how to run it, then finish.",
        ],
      },
      { type: "p", text: "I care a lot about the code handover. What we build should belong to the client. If you later want someone else to take over, you shouldn't be stuck. Projects start at ₩2,000,000." },
      { type: "p", text: "So far we've handled the planning, design and development of websites for New Korea Hope Broadcasting (NKHB), NKFI, Provision Bridge Fund, Pray4NK and BeFriends. We built the features each organization really needed, such as listening to broadcasts, prayer petition signatures, donation sign-ups, and insurance support applications and lookups." },
      { type: "h3", text: "2. Lab98 AI: AI training and community" },
      { type: "p", text: "The reason I started the AI division is simple. Looking around, I saw many people who aren't using AI well. A good tool had arrived, but many found it vaguely hard or even scary, or tried it a few times and gave up." },
      { type: "p", text: "So we're building a proper AI training program. We're starting with online and in-person classes, school programs and corporate training. We're also building our own community platform, so people can keep asking questions and sharing after the class ends. The community will open soon." },
      { type: "p", text: "The test is the same here. AI isn't meant to replace people. We want to help people use AI well as a tool." },
      { type: "h3", text: "3. Lab98 Faith: Software for churches and mission organizations" },
      { type: "p", text: "We build, distribute and support software for churches, mission organizations and Christians. Ministry has a lot of repetitive work. With tools that take some of it off your hands, you can spend more time on people." },
      { type: "p", text: "Our first product is Praise Tool. It's a program for worship that prepares and presents song lyrics, sermon slides, Bible verses and video in one place. It can send output to the audience screen, the stage monitor and NDI for broadcast at the same time. It supports Mac and Windows, and launches on November 11, 2026. The price is ₩100,000, a perpetual license: buy once and use it for good." },
      { type: "h2", text: "Lab98 today" },
      { type: "p", text: "Right now, Lab98 is just me, the developer and founder. A small team has its advantages. You talk directly with me, and one person is responsible for the work from planning through development." },
      { type: "p", text: "We're also looking for people to join us." },
      { type: "list", items: ["Designer: someone who wants to work out screens that are easy on the people using them", "Full-stack developer: someone to build websites and software with us", "Writer: someone who can explain technology and ministry in plain words"] },
      { type: "h2", text: "Let's build together" },
      { type: "p", text: "If you have a website or program in mind, need AI training, or want a tool for your ministry, get in touch. We reply within 2 business days." },
      { type: "p", text: "Technology is a tool, not the boss. Lab98 wants to be a company that builds good tools and helps people use them well." },
    ],
  },
};

export const notes: Note[] = koNotes.map((n) => ({ ...n, ...noteEn[n.slug], author: "Vincent Jeon" }));

export function getNote(slug: string) {
  return notes.find((n) => n.slug === slug);
}

const devInfo = divisions.find((d) => d.slug === "dev")!;
/** "NKHB, NKFI, Provision Bridge Fund, Pray4NK, BeFriends" */
const projectNames = projects.map((p) => p.clientEn ?? p.client).join(", ");

export const faqs: Record<FaqKey, Faq[]> = {
  home: [
    {
      q: "What kind of company is Lab98?",
      a: "Lab98 has three divisions. Dev builds websites, online stores and Mac/Windows software. AI teaches AI. Faith builds software for churches and mission organizations. The registered business is JJdream, and Lab98 is its brand.",
    },
    { q: "What does the 98 in Lab98 mean?", a: site.nameMeaning },
    {
      q: "Who builds it?",
      a: `${site.founder.display}, a developer and founder, started Lab98. He talks with clients directly and handles each project from planning through development.`,
    },
    { q: "Whose websites have you built?", a: `We handled planning, design and development for the websites of ${projectNames}.` },
    { q: "How soon will I get a reply?", a: `Contact us through the form or at ${site.email}. ${site.replyTime}.` },
  ],
  dev: [
    { q: "How much does a website cost?", a: "Prices start at KRW 2M. Once we hear what you need built, we give you an exact quote." },
    { q: "Can you build an online store?", a: "Yes. We build stores around how you run your business, from product pages to orders. We build from scratch, with no templates." },
    { q: "Do you also build Mac and Windows software?", a: "Yes. We build desktop software for Mac and Windows that takes repetitive work off your hands." },
    {
      q: "How does a project run?",
      a: `It has ${devInfo.process.length} steps: ${devInfo.process.map((s) => s.title).join(" → ")}. We confirm the screens and structure with mockups before we build.`,
    },
    { q: "Do I get the source code when the work is done?", a: "Yes. We hand over the source code at launch, so you are not stuck if you manage it somewhere else later." },
    { q: "Whose sites have you built?", a: `We built the websites of ${projectNames}. You can see the screens and main features on the projects page.` },
  ],
  ai: [
    { q: "How is the AI training run?", a: "It is run as online and in-person classes, with a focus on hands-on practice. We match the level, from people just starting out to people who want to use AI at work right away." },
    { q: "Do you train schools and companies?", a: "Yes, we run school training and company training. For companies, we use your team's real work as examples so you can use AI from the next day." },
    { q: "How do you decide what to teach?", a: "Tell us who the training is for, how many people and what topics you want. We will propose a curriculum that fits your level and goals." },
    { q: "How much does AI training cost?", a: "There is no public price list. We will give you a price after we hear the audience, group size and topic." },
    { q: "When does the AI community open?", a: "We are building it now, and it is opening soon. We will tell you first when it opens." },
  ],
  faith: [
    {
      q: "What does Lab98 Faith build?",
      a: "We build, distribute and run software for churches, mission organizations and Christians. Our first product is Praise Tool, a program for worship lyrics and media output.",
    },
    { q: "Can a church ask for custom software?", a: "Yes. We listen to the repeated tasks and pain points in your ministry, then build custom software with the features you really need." },
    { q: "Do you keep supporting it after it is built?", a: "Yes. We stay with you after release, from installation to updates and troubleshooting." },
    { q: "What computers can I use it on?", a: "We release it so it is easy to install and use on Mac and Windows." },
    { q: "When does Praise Tool launch?", a: "It launches on November 11, 2026. The price is KRW 100,000. It is a perpetual license: buy it once and use it as long as you like." },
  ],
  praiseTool: [
    {
      q: "What is Praise Tool?",
      a: "It is a worship program for preparing and outputting song lyrics, sermon slides, Bible verses and video in one place. You can send output to the audience screen, the stage monitor and broadcast NDI at the same time.",
    },
    { q: "When does it launch, and how much does it cost?", a: "It launches on November 11, 2026. The price is KRW 100,000. It is a perpetual license: buy it once and use it as long as you like." },
    { q: "Which operating systems does it support?", a: "It supports both macOS and Windows. The program interface is available in Korean, English, Chinese and Japanese." },
    { q: "Does it support NDI?", a: "Yes. You can send output over NDI straight to broadcast software such as OBS, vMix and Wirecast. NDI is not available in the macOS Intel version, though." },
    { q: "Can I change slides from my phone?", a: "Yes. You can change slides from a smartphone on the same Wi-Fi network. You can also control it with a Stream Deck." },
    { q: "How do I get a launch notification?", a: "Leave your email in the launch notification form on this page. We will email you once when it launches, and we will not send ads." },
  ],
};

export type { Division };
