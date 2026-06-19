import Hero from "@/components/Hero";
import SuccessStories from "@/components/SuccessStories";
import WhySection from "@/components/Whysection";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Hero></Hero>
      <SuccessStories></SuccessStories>
      <WhySection></WhySection>
    </div>
  );
}
