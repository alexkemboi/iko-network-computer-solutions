import { useEffect } from 'react';
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

function App() {
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

export default App;
