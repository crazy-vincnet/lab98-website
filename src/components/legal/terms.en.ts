import type { LegalDocCopy } from "./legal-copy-types";
import { TERMS_DEFAULT_VERSION } from "./terms.copy";

/** English translation of the terms of use; the Korean version prevails. */
export const termsEn: LegalDocCopy = {
  title: "Terms of Use",
  intro: ["The conditions you must follow when using the {host} website, and the rights and duties of the Company and users. By using the Site, you are treated as having agreed to these Terms."],
  introNote: "This is an English translation for convenience; the Korean version prevails.",
  effectiveDate: "November 1, 2026",
  version: TERMS_DEFAULT_VERSION,
  sections: [
    {
      id: "purpose",
      heading: "Purpose",
      blocks: [{ p: "These Terms set out the conditions and procedures for using the website {host} (the “Site”) operated by {company} (the “Company”), and the rights and duties of the Company and users." }],
    },
    {
      id: "definitions",
      heading: "Definitions",
      blocks: [
        {
          ul: [
            "“Site”: the website the Company operates at the {host} domain and its subpages",
            "“User”: anyone who visits the Site and uses the Service under these Terms",
            "“Service”: the information and features the Company provides free of charge on the Site (described in Section 4)",
          ],
        },
      ],
    },
    {
      id: "notice",
      heading: "Posting and changing the Terms",
      blocks: [
        {
          ul: [
            "The Company posts these Terms on the Site where users can easily find them.",
            "The Company may change these Terms as long as the change does not violate applicable laws.",
            "When the Terms change, the Company will post the effective date and the reason on the Site starting 7 days before the change takes effect. For changes that are unfavorable to users, the notice starts 30 days before.",
            "If you do not agree to the changed Terms, you can stop using the Site.",
          ],
        },
      ],
    },
    {
      id: "service",
      heading: "What the Service includes",
      blocks: [
        { p: "The Company provides the following services on the Site." },
        {
          ul: [
            "Introductions to the Company and its services (Dev, AI, Faith) and to project case studies",
            "Receiving [inquiries](link:contact)",
            "[Praise Tool](link:praise) launch notification sign-up",
            "Information such as Insights articles",
          ],
        },
      ],
    },
    {
      id: "obligations",
      heading: "User obligations",
      blocks: [
        { p: "Users must not do any of the following." },
        {
          ul: [
            "Enter false information, or use another person's email address or other information without permission",
            "Send forms in bulk using programs or other automated means",
            "Interfere with the operation of the Site or harm its security (unauthorized access, sending malicious code, excessive requests, and so on)",
            "Infringe the rights of the Company or others, or break the law",
          ],
        },
        { p: "If the Company confirms any of these acts, it may decline to process the related inquiry or sign-up, or restrict access." },
      ],
    },
    {
      id: "inquiries",
      heading: "Nature of inquiries and quotes",
      blocks: [
        {
          ul: [
            "Submitting an inquiry through the Site, or receiving a quote or consultation, does not by itself create a contract.",
            "Dev development contracts, AI training and Praise Tool purchases are each governed by a separate contract or terms, and the individual contract prevails over these Terms.",
            "Purchase and refund conditions for Praise Tool will be posted separately before sales begin. The Site does not currently sell anything online.",
          ],
        },
      ],
    },
    {
      id: "ip",
      heading: "Intellectual property",
      blocks: [
        {
          ul: [
            "The Company owns the rights to the content on the Site, including text, images, logos and designs. You may not copy, distribute or modify it for commercial use without the Company's permission.",
            "The screens and names of client sites shown in project case studies belong to the respective organizations, and the Company publishes them with their consent.",
          ],
        },
      ],
    },
    {
      id: "links",
      heading: "External links",
      blocks: [{ p: "The Site may contain links to external sites, such as client sites. The Company does not operate those sites and is not responsible for their content or their handling of personal information." }],
    },
    {
      id: "changes-service",
      heading: "Changing or suspending the Service",
      blocks: [
        {
          ul: [
            "The Company may change or suspend all or part of the Service when operational or technical needs require it.",
            "The Service may be suspended temporarily for equipment maintenance, outages, natural disasters and similar causes. When we can give notice in advance, we will post it on the Site.",
          ],
        },
      ],
    },
    {
      id: "disclaimer",
      heading: "Disclaimer",
      blocks: [
        {
          ul: [
            "Information on the Site is general information provided free of charge, and we do not guarantee that it suits any particular purpose. If you need a specific judgment, please contact us.",
            "The Company is not liable for damage caused by the user's own fault, or for damage arising from use of information provided free of charge. This does not apply to damage caused by the Company's intent or gross negligence.",
          ],
        },
      ],
    },
    {
      id: "privacy",
      heading: "Privacy",
      blocks: [{ p: "The Company protects users' personal information in accordance with applicable laws. For details, please see the [Privacy Policy](link:privacy)." }],
    },
    {
      id: "disputes",
      heading: "Dispute resolution",
      blocks: [
        {
          ul: [
            "The laws of the Republic of Korea apply to these Terms and to use of the Site.",
            "If a dispute arises, please contact us first at [{email}](mailto:{email}). If it cannot be resolved amicably, it will be resolved in the court that has jurisdiction under the Civil Procedure Act.",
          ],
        },
      ],
    },
    {
      id: "addendum",
      heading: "Addendum",
      blocks: [{ p: "These Terms take effect on {effectiveDate}." }],
    },
  ],
  history: [{ date: "2026. 11. 01", note: "Established" }],
};
