import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/home/Hero";
import { ClientLogos } from "@/components/home/ClientLogos";
import { Methodology } from "@/components/home/Methodology";
import { Solutions } from "@/components/home/Solutions";
import { Partners } from "@/components/home/Partners";
import { Services } from "@/components/home/Services";
import { FeaturedCase } from "@/components/home/FeaturedCase";
import { Tools } from "@/components/home/Tools";
import { Insights } from "@/components/home/Insights";
import { Testimonials } from "@/components/home/Testimonials";
import { FinalCTA } from "@/components/home/FinalCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <ClientLogos />
        <Methodology />
        <Solutions />
        <Partners />
        <Services />
        <FeaturedCase />
        <Tools />
        <Insights />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
