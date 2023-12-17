import React from 'react';
import logo from '../../images/logo.png';
const NavbarComponent = () => {
  const style={
    width: '50px',
    height: '50px',
  }
  return (
    <nav className="navbar navbar-expand-sm navbar-light bg-success fixed-top">
  <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
    <span className="navbar-toggler-icon navbar-light"></span>
  </button>
  <div className="collapse navbar-collapse mt-2" id="navbarTogglerDemo01">
    <a className="navbar-brand p-1 bg-light mr-50 rounded-circle" href="/"> 
        <img src={logo} alt="Logo" className="logo-img navbar-icon " style={style} />                      
    </a>
    <ul className="navbar-nav m-auto" >
        <li className="nav-item">
            <a className="nav-link text-white display-6 font-weight-bolder" href="/">About us</a>
        </li>
        <li className="nav-item dropdown">
            <a className="nav-link text-white display-6 font-weight-bolder" href="/" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Softwares</a>
        </li> 
        <li className="nav-item dropdown">
            <a className="nav-link text-white display-6 font-weight-bolder" href="/" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Cyber</a>
        </li>    
        <li className="nav-item dropdown">
            <a className="nav-link text-white display-6 font-weight-bolder" href="/" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Computers</a>
        </li>
        <li className="nav-item dropdown">
            <a className="nav-link text-white display-6 font-weight-bolder" href="/" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Services
            </a>      
        </li>
        <li className="nav-item">
            <a className="nav-link text-white display-6 font-weight-bolder" href="/">Contact Us</a>
        </li>
        <li className="nav-item">
            <a className="nav-link text-success bg-white rounded-pill  py-2 px-4 font-weight-bold" href="/">
               login
            </a>
        </li>
    </ul>
</div>

</nav>
  );
};

export default NavbarComponent;
