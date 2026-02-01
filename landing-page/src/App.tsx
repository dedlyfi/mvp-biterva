import { useEffect } from 'react';
import ReactGA from 'react-ga4';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { DeFiSection } from './components/DeFiSection';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

// Initialize GA4 - Placeholder ID, user should replace this
const MEASUREMENT_ID = 'G-XXXXXXXXXX'; 
try {
  ReactGA.initialize(MEASUREMENT_ID);
} catch (e) {
  console.warn("GA4 Initialization failed (likely due to invalid ID)", e);
}

function App() {
  useEffect(() => {
    try {
      ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    } catch (e) {
      // Ignore GA errors in dev
    }
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans selection:bg-brand-primary selection:text-white">
      <Header />
      <main>
        <Hero />
        <Features />
        <DeFiSection />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
