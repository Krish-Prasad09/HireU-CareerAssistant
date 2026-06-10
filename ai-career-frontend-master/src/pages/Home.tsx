import CTABanner from "../components/ctabanner";
import Features from "../components/features";
import Hero from "../components/hero";
import Pricing from "../components/pricing";
import Reviews from "../components/reviews";

const Home = () => {
  return (
    <div className="bg-page">
      <Hero />
      <Features />
      <Reviews />
      <Pricing />
      <CTABanner />
    </div>
  );
};

export default Home;
