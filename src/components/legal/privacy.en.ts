import type { LegalDocCopy } from "./legal-copy-types";
import { PRIVACY_DEFAULT_VERSION } from "./privacy.copy";

/** English translation of the privacy policy. Facts must match privacy.copy.ts; the Korean version prevails. */
export const privacyEn: LegalDocCopy = {
  title: "Privacy Policy",
  intro: [
    "{company} (the “Company”) takes your personal information seriously and complies with the Personal Information Protection Act of Korea. This policy applies to the inquiry form, Praise Tool launch notification sign-up, privacy requests and unsubscribe requests on the {host} website.",
  ],
  introNote: "This is an English translation for convenience; the Korean version prevails.",
  effectiveDate: "November 1, 2026",
  version: PRIVACY_DEFAULT_VERSION,
  sections: [
    {
      id: "purpose",
      heading: "Purposes of processing",
      blocks: [
        { p: "The Company processes personal information only for the purposes below. If a purpose changes, we will tell you in advance and, where required, ask for your separate consent." },
        {
          ul: [
            "Inquiry form: confirming and answering your inquiry, handling quotes and consultations, and preventing spam and repeated submissions",
            "[Praise Tool](link:praise) launch notification sign-up: sending one email announcing the November 11, 2026 launch, and preventing spam and repeated sign-ups",
            "Privacy requests: handling requests to access, correct, delete or suspend processing, verifying identity, and recording the result",
            "Unsubscribe: keeping track of people who have opted out so that we do not email them again",
          ],
        },
        { p: "We do not use personal information for marketing or advertising." },
      ],
    },
    {
      id: "items",
      heading: "Personal information we process",
      blocks: [
        { p: "We collect personal information only when you type it into a form on this website and submit it. There is no account registration." },
        {
          table: {
            caption: "Items processed by form",
            head: ["Form", "Required", "Optional", "Collected automatically"],
            rows: [
              ["Inquiry form", "Email, inquiry content, inquiry category", "Name or company name", "IP hash (cannot be reversed), time received"],
              ["Praise Tool launch notification sign-up", "Email", "Church or organization name", "IP hash (cannot be reversed), time of sign-up"],
              ["Privacy request", "Email, request type, request details", "None", "Time received"],
              ["Unsubscribe", "Email", "None", "Time registered"],
            ],
          },
        },
        { p: "An IP hash is a value made from your IP address in a way that cannot be turned back into the original. We use it only to prevent spam and repeated submissions. We do not store the IP address itself." },
      ],
    },
    {
      id: "retention",
      heading: "Retention and use period",
      blocks: [
        {
          table: {
            caption: "Retention and use period",
            head: ["Form", "Retention period", "When it is destroyed"],
            rows: [
              ["Inquiry form", "1 year after the inquiry is closed", "Deleted automatically when the period ends"],
              ["Praise Tool launch notification sign-up", "Until the launch announcement email is sent", "Deleted automatically without delay after sending, and no later than 30 days after the launch date"],
              ["Privacy request", "The record of the result is kept for 3 years after the request is completed (in case of disputes)", "Deleted when the period ends"],
              ["Unsubscribe", "Until you ask to be removed from the list", "Deleted without delay on request"],
            ],
          },
        },
        { p: "If another law requires information to be kept for a certain period, we keep it separately for that period. If an inquiry leads to a contract, information related to the contract is managed separately under that contract and the applicable laws." },
      ],
    },
    {
      id: "destruction",
      heading: "Destruction procedure and method",
      blocks: [
        {
          ul: [
            "Procedure: information whose retention period has ended or whose purpose has been fulfilled is destroyed by an automatic deletion job that runs regularly. Information that is not covered by automatic deletion is destroyed manually without delay once we have confirmed it.",
            "Method: electronic information is deleted from the database in a way that cannot be recovered. Any paper printouts are shredded or incinerated.",
          ],
        },
      ],
    },
    {
      id: "third-party",
      heading: "Provision to third parties",
      blocks: [{ p: "The Company does not provide personal information to third parties. The exceptions are where you have separately consented, or where the law specifically provides otherwise (for example, a lawful request from an investigative authority)." }],
    },
    {
      id: "outsourcing",
      heading: "Outsourced processing and overseas transfer",
      blocks: [
        { p: "To run the service, we entrust the processing of personal information to the processors below. As a result, personal information is stored and processed outside Korea." },
        {
          table: {
            caption: "Outsourced processing and overseas transfer",
            head: ["Processor", "Entrusted task", "Transfer location", "Items transferred"],
            rows: [
              ["InsForge", "Database storage and server operation", "Cloud servers in the Asia-Pacific (ap-southeast) region", "All items in Section 2"],
              ["Amazon Web Services (SES, used through InsForge)", "Sending receipt notification emails and launch announcement emails", "Amazon Web Services cloud servers", "Email address, and the inquiry or sign-up content included in the email body"],
            ],
          },
        },
        {
          ul: [
            "When and how it is transferred: transferred over encrypted communication (HTTPS) as soon as you submit a form.",
            "Retention and use period: the same as in Section 3.",
            "How to refuse: if you do not want your information transferred overseas, please email [{email}](mailto:{email}) directly instead of using the form.",
          ],
        },
        { p: "If a processor or the entrusted task changes, we will say so in this policy." },
      ],
    },
    {
      id: "rights",
      heading: "Your rights and how to exercise them",
      blocks: [
        { p: "You can ask at any time to access, correct or delete your personal information, to suspend its processing, or to withdraw your consent." },
        {
          ul: [
            "How to ask: use the [privacy request form](link:privacyRequest) or email [{email}](mailto:{email}).",
            "Identity check: we confirm it is you by getting a reply from the email address on record.",
            "Time to respond: we handle the request and tell you the result within 10 days of receiving it. If we limit or refuse a request as the law allows, we will also tell you why.",
            "You can also make a request through a legal representative or an authorized agent. In that case, we need documents that confirm the authorization.",
          ],
        },
        { button: "Make a privacy request", href: "privacyRequest" },
      ],
    },
    {
      id: "children",
      heading: "Children under 14",
      blocks: [{ p: "The Company does not accept personal information from children under 14. If we learn that information from a child under 14 has been submitted, we will destroy it without delay." }],
    },
    {
      id: "cookies",
      heading: "Automatic collection tools: installation, operation and refusal",
      blocks: [
        { p: "This website does not currently set cookies, and it does not use external analytics or advertising scripts. The only thing it stores in your browser is your cookie consent choice (`lab98-consent`)." },
        { p: "If we add a visitor statistics tool, we will update this policy first and make the tool run only if you consent. For details, see the [Cookie Policy](link:cookies)." },
      ],
    },
    {
      id: "marketing",
      heading: "Promotional messages and opting out",
      blocks: [
        { p: "The Company does not currently send promotional messages (marketing emails). If we do in the future, we will get your separate consent in advance as required by Article 50 of the Act on Promotion of Information and Communications Network Utilization and Information Protection, mark the subject line with “(advertisement)”, and include opt-out instructions in every email." },
        { p: "If you do not want to receive email, you can opt out at any time on the [unsubscribe](link:unsubscribe) page. The unsubscribe link in an email we sent takes effect immediately. If you type an address in yourself, so that nobody can opt out someone else, we send one confirmation email, only to an address already on our list, and the request takes effect when you press the link in it. To prevent repeated sends we keep an irreversible hash of that address for at most one day." },
      ],
    },
    {
      id: "security",
      heading: "Security measures",
      blocks: [
        {
          ul: [
            "Encryption in transit: all communication is encrypted with HTTPS.",
            "Least access: the database can be reached only with the server's administrator key. Row-level security (RLS) policies block access with the public key.",
            "Data minimization: IP addresses are stored only as hashes that cannot be reversed.",
            "Separate storage of secret keys: access keys are kept in the server environment, apart from the source code.",
          ],
        },
      ],
    },
    {
      id: "officer",
      heading: "Privacy officer",
      blocks: [
        { p: "For questions, complaints or remedies about the handling of personal information, please contact the officer below. We will reply and act without delay." },
        { ul: ["Privacy officer: {officer}, Representative", "Contact: [{email}](mailto:{email})"] },
      ],
    },
    {
      id: "remedy",
      heading: "Remedies for infringement of your rights",
      blocks: [
        { p: "If you need to report a privacy violation or get advice, you can contact the agencies below." },
        {
          table: {
            caption: "Agencies for remedies",
            head: ["Agency", "Phone", "Website"],
            rows: [
              ["Personal Information Dispute Mediation Committee", "1833-6972", "[www.kopico.go.kr](https://www.kopico.go.kr)"],
              ["Personal Information Infringement Report Center (Korea Internet & Security Agency)", "118", "[privacy.kisa.or.kr](https://privacy.kisa.or.kr)"],
              ["Supreme Prosecutors' Office", "1301", "[www.spo.go.kr](https://www.spo.go.kr)"],
              ["Korean National Police Agency", "182", "[ecrm.police.go.kr](https://ecrm.police.go.kr)"],
            ],
          },
        },
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      blocks: [{ p: "This policy applies from {effectiveDate}. If it changes, we will post a notice on this page starting 7 days before the change takes effect, and starting 30 days before for significant changes to your rights. You can see past changes in the revision history below." }],
    },
  ],
  history: [{ date: "2026. 11. 01", note: "Established" }],
};
