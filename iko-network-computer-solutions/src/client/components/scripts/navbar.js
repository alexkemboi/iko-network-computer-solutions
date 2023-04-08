import logo from '../../images/logo.png';
import '../styles/navbarStyles.css';
function Navbar() {
  return (
    <div>
      <header class="container">
      <nav class="navbar navbar-expand-md navbar-dark bg-success text-light">
                    <div class=" logo navbar-brand">
                        <img src={logo} alt="Kogo" class="logo-img ml-5"/>
                    </div>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                      <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                      <ul class="navbar-nav mr-auto">
                        <li class="nav-item active">
                          <a class="nav-link text-white" href="#">Home</a>
                        </li>
                        <li class="nav-item">
                          <a class="nav-link text-white" href="#">About Us</a>
                        </li>
                        <li class="nav-item " >
                            <a class="nav-link text-white " href="#" id="softwaresNavItem">Softwares</a>
                            <ul class="dropdown-menu" id="dropdown-menu">
                              <li><a class="dropdown-item" href="#">Website development</a></li>
                              <li><a class="dropdown-item" href="#">Desktop application</a></li>
                              <li><a class="dropdown-item" href="#">Mobile application</a></li>
                              <li><a class="dropdown-item" href="#">Softwares sales</a></li>
                            </ul>
                          </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="#">Cyber</a>
                            <ul class="dropdown-menu">
                              <li><a href="#">Bulk Printing </a></li>
                              <li><a href="#">Passport application</a></li>
                              <li><a href="#">Kra services</a></li>
                              <li><a href="#">Driving Licence</a></li>
                              <li><a href="#">Tsc Online services</a></li>
                              <li><a href="#">Graphics Design</a></li>
                              <li><a href="#">E-citizen services</a></li>
                            </ul>
                          </li>
                        <li class="nav-item">
                          <a class="nav-link text-white" href="#">Computers</a>
                          <ul class="dropdown-menu">
                            <li><a href="#">Laptops</a></li>
                            <li><a href="#">Desktops</a></li>
                            <li><a href="#">Monitors</a></li>
                            <li><a href="#">Keyboards</a></li>
                            <li><a href="#">Cables</a></li>
                            <li><a href="#">Mouse</a></li>
                            <li><a href="#">Accessories</a></li>
                          </ul>
                        </li>
                        <li class="nav-item">
                          <a class="nav-link text-white" href="#">Services </a>
                          <ul class="dropdown-menu">
                            <li><a href="#">Graphic design</a></li>
                            <li><a href="#">Online Services</a></li>
                            <li><a href="#">CCTV Installation</a></li>
                            <li><a href="#">Network installation</a></li>
                            <li><a href="#">Branding</a></li>
                            <li><a href="#">Computer Maintenance</a></li>
                          </ul>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="#">Careers</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="#">Blog</a>
                          </li>
                        <li class="nav-item">
                          <a class="nav-link text-white" href="#">Contact Us</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="#"><i class="fas fa-user"></i>Account</a>
                        </li>
                      </ul>
                    </div>
                  </nav>  
      </header>
    </div>



  );
  
  var softwaresNavItem = document.getElementById('softwaresNavItem');
    var dropdownMenu = document.querySelector('#dropdown-menu');
    
    softwaresNavItem.addEventListener('mouseover', function() {
        dropdownMenu.classList.add('show');
    });
    
    softwaresNavItem.addEventListener('mouseout', function() {
        dropdownMenu.classList.remove('show');
    });
}

export default Navbar;
