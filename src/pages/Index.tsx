import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/home/Hero";
import { LogosMarquee } from "@/components/home/LogosMarquee";
import { Manifesto } from "@/components/home/Manifesto";
import { Metrics } from "@/components/home/Metrics";
import { Solutions } from "@/components/home/Solutions";
import { Services } from "@/components/home/Services";
import { Cases } from "@/components/home/Cases";
import { Tools } from "@/components/home/Tools";
import { Testimonials } from "@/components/home/Testimonials";
import { BlogPreview } from "@/components/home/BlogPreview";
import { PodcastPreview } from "@/components/home/PodcastPreview";
import { FinalCTA } from "@/components/home/FinalCTA";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <LogosMarquee />
        <Manifesto />
        <Metrics />
        <Solutions />
        <Services />
        <Cases />
        <Tools />
        <Testimonials />
        <BlogPreview />
        <PodcastPreview />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
