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
    <a className="navbar-brand p-2 bg-light" href="/"> 
        <img src={logo} alt="Logo" className="logo-img  navbar-icon" style={style} />                      
    </a>
    <ul className="navbar-nav mr-auto mr-0 mt-lg-0">
                  <li className="nav-item">
                        <a className="nav-link text-white display-6 font-weight-bolder" href="/">About us</a>
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
                            <a className="nav-link text-success bg-white rounded display-6 font-weight-bolder p-2" href="/"><i className="fas fa-user mr-2"></i>login</a>
                        </li>
    </ul>
    {/* <form className="form-inline my-2 my-lg-0">
      <input className="form-control mr-sm-2 bg-light" type="search" placeholder="Search" aria-label="Search"/>
      <button className="btn btn-outline-light my-2 my-sm-0" type="submit">Search</button>
    </form> */}
  </div>
</nav>
  );
};

export default NavbarComponent;
