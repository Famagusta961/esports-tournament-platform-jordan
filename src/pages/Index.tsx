import { useLayoutEffect } from "react";
import { scrollToTop } from "@/lib/scroll-utils";
import HeroSection from "@/components/home/HeroSection";
import GameCategories from "@/components/home/GameCategories";
import FeaturedTournaments from "@/components/home/FeaturedTournaments";
import HowItWorks from "@/components/home/HowItWorks";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  // Force Home to top after render - multiple safety resets
  useLayoutEffect(() => {
    console.log('Index component mounted - forcing scroll to top');
    
    // Immediate scroll
    scrollToTop();
    
    // Safety after render
    requestAnimationFrame(() => {
      console.log('Index - requestAnimationFrame scroll reset');
      scrollToTop();
    });
    
    // Final safety after delay
    setTimeout(() => {
      console.log('Index - setTimeout scroll reset');
      scrollToTop();
    }, 50);
    
    // Extra safety for carousel auto-scroll interference  
    setTimeout(() => {
      console.log('Index - final safety scroll reset');
      scrollToTop();
    }, 200);
  }, []);

  return (
    <>
      <HeroSection />
      <GameCategories />
      <FeaturedTournaments />
      <HowItWorks />
      <CTASection />
    </>
  );
};

export default Index;