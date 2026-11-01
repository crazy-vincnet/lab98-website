/**
 * English copy for the Praise Tool product page + launch form. Twin of ./praise-tool.ts (Korean).
 * Import `getPraiseTool(locale)`; never import praiseToolEn directly.
 * Owner: translation agent "praise-tool".
 * Keep prices, dates and numbers identical to the Korean file (facts are confirmed with the client).
 */
import type { Dict, Locale } from "@/lib/i18n";
import { praiseTool } from "./praise-tool";

export const praiseToolEn: Dict<typeof praiseTool> = {
  meta: {
    title: "Praise Tool — Lyrics and media software for worship",
    description:
      "Prepare and present song lyrics, sermon slides, Bible verses and video from one program. Output to the audience screen, stage monitor and NDI for broadcast at the same time. Works on macOS and Windows. Launching November 11, 2026.",
  },

  hero: {
    eyebrow: "Lab98 Faith · First product",
    title: "Praise Tool",
    sub: "Lyrics and media software for worship",
    lead: "Prepare and present song lyrics, sermon slides, Bible verses and video from one program. It sends output to the audience screen, the stage monitor and NDI for broadcast at the same time, so one program can run the whole service.",
    badges: ["macOS · Windows", "Korean · English · 中文 · 日本語"],
    priceLabel: "Price",
    price: "₩100,000",
    license: "Perpetual license",
    licenseNote: "Buy once, use it for good",
    launchLabel: "Launch",
    launch: "Launching November 11, 2026",
    ctaNotify: "Get a launch alert",
    ctaFeatures: "See the features",
    screenshot: "Screenshot coming soon",
    screenshotAlt: "Placeholder for a Praise Tool operator screen screenshot",
  },

  /** D-day badge (Asia/Seoul). */
  dday: {
    label: "Until launch",
    today: "Launches today",
    released: "Released",
    /** Shown before the browser computes the real value. */
    fallback: "11.11",
  },

  glance: {
    eyebrow: "At a glance",
    title: "At a glance",
    items: [
      { title: "Paste the lyrics once and the slides are done", body: "Slides split at blank lines. Headings such as Verse 1, Chorus, Bridge and [Verse 1] are recognized automatically." },
      { title: "Several screens at once", body: "Assign the audience screen, a lyrics-only screen for broadcast, and the stage monitor to separate displays." },
      { title: "Broadcast connection", body: "Send directly to OBS, vMix, Wirecast and others over NDI, or Syphon on macOS." },
      { title: "Change slides from your phone", body: "Control the slides from a smartphone on the same Wi-Fi. Stream Deck works too." },
      { title: "Safe output", body: "Backs up automatically, and restores the last output state if the program closes unexpectedly." }, // reconstructed
    ],
  },

  features: {
    eyebrow: "Features",
    title: "Features",
    lead: "Everything a service needs: preparing lyrics, presenting, broadcast connections and service planning.",
    groups: [
      {
        key: "lyrics",
        title: "Preparing lyrics",
        items: [
          { title: "Paste and import", body: "Cleans up the odd spacing in lyrics copied from the web. You can import songs as text, from CCLI SongSelect, or in OpenLyrics format." }, // reconstructed
          { title: "Song order (Arrangement)", body: "Set a repeat order such as Verse 1 – Chorus – Verse 2 – Chorus – Bridge – Chorus without copying slides." }, // reconstructed
          { title: "Two-language lyrics", body: "Start a line with > and it becomes the translation of the line above. Translation lines appear in smaller type under the original." }, // reconstructed
          { title: "Chords and transposing", body: "Write chords in the lyrics, like [G]. They show only on the stage monitor, not on the audience screen. Chords can be transposed." }, // reconstructed
          { title: "Song info and search", body: "Save the lyricist and composer, key, tempo, CCLI number, copyright and tags. Search by title, lyrics or info." },
        ],
      },
      {
        key: "design",
        title: "Design",
        items: [
          { title: "Slide design", body: "Place text and shapes freely on a 16:9 screen, as in PowerPoint, to design a slide." }, // reconstructed
          { title: "Themes", body: "Save a design you use often as a theme and apply it to selected slides. Themes can be exported and imported on another computer." }, // reconstructed
          { title: "Sermon and announcement templates", body: "Make sermon and announcement slides from templates with title and body layouts." }, // reconstructed
          { title: "Backgrounds and transitions", body: "Solid color, image and looping video backgrounds, with fade, slide and cut transitions." }, // reconstructed
        ],
      },
      {
        key: "bible",
        title: "Bible verses",
        items: [
          { title: "Jump to a verse", body: "Type John 3:16-18 or Jn 3:16 and the verse appears." }, // reconstructed
          { title: "Word search", body: "You can also search by a word, such as “love” or “faith”." },
          { title: "Second Bible", body: "Pick a second Bible and its text shows alongside the first." }, // reconstructed
          { title: "Add your own Bible files", body: "Bible text is not included. Add Bible files you already have (text, CSV, JSON, Zefania XML, OSIS XML) and use them." }, // reconstructed
        ],
      },
      {
        key: "output",
        title: "Output and screens",
        items: [
          { title: "Assign screen roles", body: "Give each connected display a role: audience screen, audience screen (lyrics only) or stage monitor. Settings are remembered. If you unplug a cable and plug it back in, the window returns on its own." }, // reconstructed
          { title: "Stage monitor", body: "Shows the current lyrics, the next slide, a large clock, a timer, stage notes and chords. You can change the layout." }, // reconstructed
          { title: "Layers", body: "Background, media, lyrics, countdown, logo and message are stacked in layers. Turn each layer off on its own, or all at once." }, // reconstructed
          { title: "Media", body: "Present images, video and audio with one click. You can attach a backing track (MR) to a song and play it." },
          { title: "Countdown and logo", body: "Show a countdown such as “in 10 minutes” or “until 11:00”, a logo in the corner, and a lower-third message." },
          { title: "Rehearsal mode (R)", body: "Step through slides ahead of time on the operator screen only, while the audience screen stays as it is." },
        ],
      },
      {
        key: "broadcast",
        title: "Broadcast and external devices",
        items: [
          { title: "NDI output", body: "One mode sends the whole screen at 1920×1080, 30 fps. The other sends only the lyrics on a transparent background, for broadcast captions. Media sound goes out as NDI audio too." }, // reconstructed
          { title: "Syphon output (macOS)", body: "Sends the screen to other programs on the same Mac." }, // reconstructed
          { title: "Phone remote", body: "From a smartphone on the same Wi-Fi, use previous and next, black screen and slide shortcuts. You can also see the service order list." }, // reconstructed
          { title: "Stream Deck / Bitfocus Companion", body: "Build buttons with HTTP commands, and show the current state on the buttons." },
          { title: "Clickers and foot pedals", body: "They work without extra setup, and you can change the keys as you like." },
          { title: "Linking two computers", body: "A second computer follows the main computer's output exactly. It also fetches the media files it needs automatically." }, // reconstructed
        ],
      },
      {
        key: "service",
        title: "Planning and managing services",
        items: [
          { title: "Playlists", body: "Put songs in service order. The show carries on when the song changes." },
          { title: "Service templates", body: "Save “Sunday first service” as a template. Pick it and a new service is created with the same setup." }, // reconstructed
          { title: "Printable order of service and PDF", body: "Make an order sheet with key, tempo and other details. You can include the lyrics too." }, // reconstructed
          { title: "Song usage log and CCLI report", body: "Songs you present are logged automatically. Pick a date range and export it as CSV." }, // reconstructed
          { title: "Song library", body: "Keep your songs in several libraries." }, // reconstructed
        ],
      },
    ],
  },

  safety: {
    eyebrow: "Reliability",
    title: "Output you can count on",
    lead: "A service can't stop. Praise Tool is built to protect the screen and your data when something goes wrong.",
    items: [
      { title: "Automatic backups", body: "Backs up automatically at launch and whenever something changes. The latest 30 are kept, and you can restore any of them." }, // reconstructed
      { title: "Damage recovery", body: "If a library file is damaged, it is restored from a backup automatically." }, // reconstructed
      { title: "Output state recovery", body: "If the program closes unexpectedly, it asks next time, “Restore the last output state?” Nothing goes to the audience screen until you answer." }, // reconstructed
      { title: "Errors stay contained", body: "An error in one panel does not shut down the whole program. The audience screen goes black, then tries again on its own." }, // reconstructed
      { title: "Your data stays in your folder", body: "Songs and all other data live in the Praise Tool folder. Copy the folder to back up or move to another computer." }, // reconstructed
      { title: "Secure remote", body: "The phone remote can only be reached through a link that contains an access key." }, // reconstructed
    ],
  },

  requirements: {
    eyebrow: "Requirements",
    title: "Supported systems",
    caption: "Praise Tool supported systems",
    head: ["Item", "Support"],
    rows: [
      { label: "macOS", value: "Apple Silicon, Intel" }, // reconstructed
      { label: "Windows", value: "Installer provided" }, // reconstructed
      { label: "Language", value: "Korean (default), English, 中文, 日本語" }, // reconstructed
      { label: "Updates", value: "Automatic updates inside the app" }, // reconstructed
    ],
    note: "NDI is not supported on the macOS Intel version.",
  },

  pricing: {
    eyebrow: "Pricing",
    title: "Price",
    plan: "Perpetual license",
    price: "₩100,000",
    note: "Buy once and use it for good.",
  },

  notify: {
    eyebrow: "Launch alert",
    title: "Get a launch alert",
    lead: "We'll send you one email when Praise Tool launches on November 11. No promotional email.",
  },

  form: {
    ariaLabel: "Sign up for Praise Tool launch alert",
    emailLabel: "Email",
    emailPlaceholder: "you@church.org",
    orgLabel: "Church or organization (optional)",
    orgPlaceholder: "Youth group, ○○ Church",
    notice: {
      title: "Personal data collection and use (required)",
      rows: [
        { term: "Purpose", desc: "Send one launch email for Praise Tool" },
        {
          term: "Data",
          desc: "Email, and (optional) church or organization name",
          note: "To prevent spam, we also store your IP address after turning it into a value (a hash) that cannot be reversed.",
        },
        { term: "Retention", desc: "Deleted right after the email is sent (within 30 days of launch at the latest)" },
        { term: "If you decline", desc: "You don't have to agree. Without agreement, though, we can't send you the launch alert." },
      ],
    },
    consentLabel: "I agree to the collection and use of my personal data above (required)",
    policyBefore: "You can read the details in the",
    policyLink: "Privacy Policy",
    policyAfter: ".",
    policyNewTab: "Opens in a new tab",
    submit: "Sign up for the launch alert",
    submitting: "Signing up…",
    errors: {
      emailRequired: "Enter the email address for the alert.",
      emailInvalid: "Check the email format. Example: you@church.org",
      orgTooLong: "Keep the church or organization name within 100 characters.",
      consentRequired: "You need to agree to the collection and use of personal data to sign up.",
    },
    failure: {
      rateLimited: "Too many requests came in at once, so we paused them for now. Try again in 10 minutes, or email us at",
      server: "We couldn't sign you up. Try again in a moment, or email us at",
      fallbackAfter: ".",
    },
    success: {
      eyebrow: "Signed up",
      title: "You're signed up. We'll email you when Praise Tool launches on November 11.",
      already: "You've already signed up. We'll let you know when it launches.",
      fallbackBefore: "If you have questions, write to",
      fallbackAfter: ".",
      reset: "Sign up with another email",
    },
  },

  more: {
    text: "Need a feature that fits your church, or help getting started?",
    contact: "Contact us",
    division: "See Lab98 Faith services",
  },
};

export function getPraiseTool(locale: Locale = "ko"): Dict<typeof praiseTool> {
  return locale === "en" ? praiseToolEn : praiseTool;
}
