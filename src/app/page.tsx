import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "GABAY AI — More time for your learners",
  description:
    "Your teaching day, a little lighter. Plan lessons, build assessments, organize resources, and understand your learners with GABAY. Explore Free and Plus plans.",
};

export default function Home() {
  return <LandingPage />;
}
