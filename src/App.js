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
function App() {
  return (
    <div>
          <NavbarComponent/>
          <Home/>
          <SoftwareComponent/>
          <ProductListComponent/>         
          <ServiceListComponent/>
          <Cyber/>
          <TrainingComponent/>
          <ResearchComponent/>
          <Footer/>
    </div>
  );
}

export default App;
