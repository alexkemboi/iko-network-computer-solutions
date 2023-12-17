import './App.css';
import Cyber from "./components/Cyber/Cyber"
import NavbarComponent from "./components/Navbar/Navbar";
import Home from './components/Home/Home';
import Footer from "./components/Footer/Footer";
import SoftwareComponent from './components/SoftwareComponent/SoftwareComponent';
import ProductListComponent from './components/ProductListingComponent/ProductListingComponent';
import ServiceListComponent from './components/ServiceListingComponent/ServiceListingComponent';
import OnlineServices from "./components/OnlineServices/OnlineServices"
function App() {
  return (
    <div>
          <NavbarComponent/>
          <Home/>
          <ProductListComponent/>
          <OnlineServices/>
          <ServiceListComponent/>
          <Cyber/>
          <SoftwareComponent/>
          <Footer/>
    </div>
  );
}

export default App;
