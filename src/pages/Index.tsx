import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import GameCategories from '@/components/home/GameCategories';
import FeaturedTournaments from '@/components/home/FeaturedTournaments';
import HowItWorks from '@/components/home/HowItWorks';
import CTASection from '@/components/home/CTASection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <GameCategories />
      <FeaturedTournaments />
      <HowItWorks />
      <CTASection />
    </Layout>
  );
};

export default Index;