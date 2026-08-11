import { lazy, Suspense } from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import { AISolution, Channels, Features, Problems, Qualification, SocialProof } from '../components/ProductSections';
import { Analytics, AutomationWorkflow, CRMDashboard, LeadDetails, NotificationAndMemory, SheetsIntegration } from '../components/CRMSections';
import { FAQ, FinalCTA, Footer, Pricing, Security, Testimonials } from '../components/BusinessSections';

export default function Landing() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Navigation />
      <main id="main-content">
        <Hero />
        <SocialProof />
        <Problems />
        <AISolution />
        <Features />
        <Channels />
        <Qualification />
        <CRMDashboard />
        <LeadDetails />
        <AutomationWorkflow />
        <SheetsIntegration />
        <NotificationAndMemory />
        <Analytics />
        <Security />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
