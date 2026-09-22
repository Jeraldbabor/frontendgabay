// Public starting plans mirror the seeded offers. Account billing remains the
// source of truth for administrator-configured prices and entitlements.
export const plans = [
  {
    name: "GABAY Free",
    description: "A little guidance to get you going.",
    price: "0",
    period: "to get started",
    featured: false,
    cta: "Start for free",
    features: [
      "10 AI generation credits per month",
      "ILAW lesson and assessment tools",
      "Teaching materials and AI chat",
      "25 MB of reference storage",
      "Your personal document library",
    ],
  },
  {
    name: "GABAY Plus",
    description: "More room for your next great lesson.",
    price: "50",
    period: "per 30 days",
    featured: true,
    cta: "Get started with Plus",
    features: [
      "150 AI generation credits per month",
      "All core Free tools, plus more",
      "TOS, examinations, and intervention tools",
      "Presentations and 250 MB of storage",
      "DOCX, PDF, and PowerPoint exports",
    ],
  },
] as const;

export const questions = [
  {
    question: "What can I do with GABAY?",
    answer:
      "Bring lesson planning, assessments, teaching materials, your document library, and learner analysis into one workspace. Start with the Free tools, then explore Plus for examinations, TOS, presentations, intervention, and exports.",
  },
  {
    question: "Can I start without paying?",
    answer:
      "Yes. Create a Free account without entering payment details. The starting Free plan includes 10 AI generation credits per calendar month and 25 MB of reference storage. AI tools become available when your workspace administrator enables the service.",
  },
  {
    question: "How do I upgrade to Plus?",
    answer:
      "Create your account, open Subscription, then choose an available wallet and access duration. Follow the recipient instructions and submit your payment receipt. Your Plus access starts after administrator approval and renewals are handled manually. There is no automatic charge.",
  },
  {
    question: "Can I use my own teaching references?",
    answer:
      "Yes. Upload PDF, DOCX, or TXT references and select the sources you want to use. You can also browse curriculum and official resources supplied by your administrator. GABAY helps you inspect sources and review generated work before bringing it to class.",
  },
  {
    question: "Does GABAY replace my professional judgment?",
    answer:
      "You remain in charge of every lesson. GABAY supports drafting, organization, and analysis; you review accuracy, curriculum alignment, and what fits your learners. Generated content is not automatically an officially approved teaching resource.",
  },
] as const;
