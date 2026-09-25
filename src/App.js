import { Suspense, lazy, useEffect, useState } from 'react';
import './App.css';
import Cyber from "./components/Cyber/Cyber"
import NavbarComponent from "./components/Navbar/Navbar";
import Home from './components/Home/Home';
import Footer from "./components/Footer/Footer";
import SoftwareComponent from './components/SoftwareComponent/SoftwareComponent';
import ProductListComponent from './components/ProductListingComponent/ProductListingComponent';
import ServiceListComponent from './components/ServiceListingComponent/ServiceListingComponent';
import TrainingComponent from "./components/Training/Training"
import ResearchComponent from "./components/Research and Innovation/Research"
import Contact from "./components/Contact/Contact";
import { OrderProvider } from "./commerce/OrderContext";
import { isPortalHash } from "./portal/useHashRoute";

// The business portal (login, sign-up, dashboards) lives behind #/login, #/signup
// and #/app/... and is only downloaded when someone opens it.
const Portal = lazy(() => import("./portal/Portal"));

const usePortalRoute = () => {
  const [inPortal, setInPortal] = useState(isPortalHash);
  useEffect(() => {
    const onHash = () => setInPortal(isPortalHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return inPortal;
};

// One shared, rAF-throttled listener that feeds the cursor position to
// whichever card is hovered (used by the soft spotlight effect in theme.css).
const useCardSpotlight = () => {
  useEffect(() => {
    if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return undefined;
    let frame = null;
    const onMove = (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const card = e.target.closest && e.target.closest('.ix-card');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
};

function Website() {
  useCardSpotlight();

  return (
    <OrderProvider>
    <div>
          <NavbarComponent/>
          <main id="main-content">
            <Home/>
            <SoftwareComponent/>
            <ProductListComponent/>
            <ServiceListComponent/>
            <Cyber/>
            <TrainingComponent/>
            <ResearchComponent/>
            <Contact/>
          </main>
          <Footer/>
    </div>
    </OrderProvider>
  );
}

function App() {
  const inPortal = usePortalRoute();
  if (inPortal) {
    return (
      <Suspense fallback={<div className="px-splash" role="status">Loading…</div>}>
        <Portal />
      </Suspense>
    );
  }
  return <Website />;
}

export default App;
