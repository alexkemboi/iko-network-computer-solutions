import './App.css';
import NavbarComponent from "./components/Navbar/Navbar";
import Home from './components/Home/Home';
import Footer from "./components/Footer/Footer";
import SoftwareComponent from './components/SoftwareComponent/SoftwareComponent';
import ProductListComponent from './components/ProductListingComponent/ProductListingComponent';
import ServiceListComponent from './components/ServiceListingComponent/ServiceListingComponent'
function App() {
  return (
    <div>
          <NavbarComponent/>
          <Home/>
          <ProductListComponent/>
          <ServiceListComponent/>
          <SoftwareComponent/>
          <Footer/>
    </div>
  );
}

export default App;
