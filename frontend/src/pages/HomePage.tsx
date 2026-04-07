import React from "react";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import FeatureSection from "../components/landing/FeatureSection";
import Benefits from "../components/landing/Benefits";
import FAQSection from "../components/landing/FAQSection";
import FooterSection from "../components/landing/FooterSection";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div id="hero-section">
        <HeroSection />
      </div>

      {/* Feature Section */}
      <div id="features-section">
        <FeatureSection />
      </div>

      {/* Benefits Section */}
      <Benefits />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer Section */}
      <div id="footer-section">
        <FooterSection />
      </div>
    </div>
  );
};

export default HomePage;
