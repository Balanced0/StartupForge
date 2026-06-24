import FeaturedOpportunities from "@/components/FeaturedOpportunities";
import FeaturedStartups from "@/components/FeaturedStartups";
import Hero from "@/components/Hero";
import SuccessStories from "@/components/SuccessStories";
import WhySection from "@/components/Whysection";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Hero></Hero>
      <FeaturedStartups></FeaturedStartups>
      <FeaturedOpportunities></FeaturedOpportunities>
      <SuccessStories></SuccessStories>
      <WhySection></WhySection>
    </div>
  );
}
