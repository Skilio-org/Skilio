import { freelancers, type Freelancer } from "@/data/freelancers";

// Fictional workspace fixtures. No marketplace or payment API is called.
export const demoClients: Freelancer[] = [
  {
    ...freelancers[0],
    id: "olivia-bennett",
    name: "Olivia Bennett",
    initials: "OB",
    title: "Product lead · Northstar Studio",
    location: "London, United Kingdom",
    bio: "A small product team building simpler tools for independent businesses. We're working together on a new onboarding experience.",
    skills: ["Onboarding", "Product design", "Figma"],
    availability: "Working together on Northstar",
    responseTime: "Demo client · Replies shown are sample messages.",
  },
  {
    ...freelancers[1],
    id: "daniel-kim",
    name: "Daniel Kim",
    initials: "DK",
    title: "Co-founder · Forma",
    location: "Toronto, Canada",
    bio: "Forma helps growing teams understand their customer data. Our current project is a responsive analytics dashboard.",
    skills: ["React", "TypeScript", "Analytics"],
    availability: "Working together on Forma",
    responseTime: "Demo client · Replies shown are sample messages.",
  },
  {
    ...freelancers[2],
    id: "sarah-mitchell",
    name: "Sarah Mitchell",
    initials: "SM",
    title: "Marketing lead · Good Company",
    location: "Amsterdam, Netherlands",
    bio: "An independent brand making everyday essentials with care. We're planning our next launch and looking for a thoughtful creative partner.",
    skills: ["Content strategy", "Brand voice", "Launch planning"],
    availability: "Discussing a new project",
    responseTime: "Demo client · Replies shown are sample messages.",
  },
];
export const clientConversations = [
  {
    id: "olivia-bennett",
    preview: "The team loves the direction. Could we review the prototype on Thursday?",
    time: "10:31",
    unread: 2,
  },
  {
    id: "daniel-kim",
    preview: "I've added the API notes to our brief. The staging environment is ready.",
    time: "Yesterday",
    unread: 1,
  },
  {
    id: "sarah-mitchell",
    preview: "Thanks for your proposal. Could you share a little more about your process?",
    time: "Mon",
    unread: 0,
  },
];
export const clientIntroductions: Record<string, string> = {
  "olivia-bennett":
    "Hi! I've shared the onboarding brief with you. We'd love your take on simplifying the first-run experience.",
  "daniel-kim":
    "Welcome to the project. Let's start with the overview screen and the shared chart components.",
  "sarah-mitchell":
    "Your recent work caught our eye. We are putting together a launch campaign for next month.",
};
export type DemoProject = {
  id: string;
  title: string;
  company: string;
  client: string;
  amount: number;
  due: string;
  status: "Active" | "Completed";
  milestones: { title: string; amount: number; done: boolean }[];
};
export const demoProjects: DemoProject[] = [
  {
    id: "northstar",
    title: "A better first impression",
    company: "Northstar Studio",
    client: "olivia-bennett",
    amount: 2400,
    due: "Sep 18",
    status: "Active",
    milestones: [
      { title: "Discovery & user flows", amount: 600, done: true },
      { title: "Interactive prototype", amount: 1200, done: false },
      { title: "Design handoff", amount: 600, done: false },
    ],
  },
  {
    id: "forma",
    title: "Customer analytics dashboard",
    company: "Forma",
    client: "daniel-kim",
    amount: 3600,
    due: "Sep 24",
    status: "Active",
    milestones: [
      { title: "Component foundation", amount: 1200, done: true },
      { title: "Dashboard implementation", amount: 1800, done: false },
      { title: "Testing & handoff", amount: 600, done: false },
    ],
  },
  {
    id: "good-company",
    title: "Brand messaging workshop",
    company: "Good Company",
    client: "sarah-mitchell",
    amount: 1800,
    due: "Sep 5",
    status: "Completed",
    milestones: [
      { title: "Research & workshop", amount: 900, done: true },
      { title: "Messaging guide", amount: 900, done: true },
    ],
  },
];
export const demoTransactions = [
  {
    id: "TX-1048",
    date: "Sep 12, 2026",
    description: "Discovery & user flows",
    company: "Northstar Studio",
    amount: 600,
    status: "Pending",
  },
  {
    id: "TX-1047",
    date: "Sep 10, 2026",
    description: "Component foundation",
    company: "Forma",
    amount: 1200,
    status: "Available",
  },
  {
    id: "TX-1046",
    date: "Sep 5, 2026",
    description: "Brand messaging workshop",
    company: "Good Company",
    amount: 1800,
    status: "Available",
  },
  {
    id: "TX-1045",
    date: "Aug 28, 2026",
    description: "Website content refresh",
    company: "Fieldwork",
    amount: 2400,
    status: "Paid out",
  },
];
export const money = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    amount,
  );
