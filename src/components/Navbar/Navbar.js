import React from "react";
import { FaBars } from "react-icons/fa";
import logo from "../../images/logo.png";

const NavbarComponent = () => {
  return (
    <>
      <nav className="navbar-wrapper">
        <div className="navbar-container navbar navbar-expand-lg">
          {/* Logo */}
          <a href="/" className="navbar-brand-custom">
            <img
              src={logo}
              alt="IKONEX Logo"
              className="logo-img"
            />

            <div className="brand-text">
              <span className="brand-primary">
                IKONEX
              </span>

              <span className="brand-secondary">
                SYSTEMS
              </span>
            </div>
          </a>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler custom-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <FaBars />
          </button>

          {/* Menu */}
          <div
            className="collapse navbar-collapse justify-content-end"
            id="mainNavbar"
          >
            <ul className="navbar-nav custom-nav">
              <li className="nav-item">
                <a href="/" className="nav-link-custom active">
                  About Us
                </a>
              </li>

              <li className="nav-item">
                <a href="/" className="nav-link-custom">
                  Software
                </a>
              </li>

              <li className="nav-item">
                <a href="/" className="nav-link-custom">
                  Cyber Services
                </a>
              </li>

              <li className="nav-item">
                <a href="/" className="nav-link-custom">
                  Computers
                </a>
              </li>

              <li className="nav-item">
                <a href="/" className="nav-link-custom">
                  Services
                </a>
              </li>

              <li className="nav-item">
                <a href="/" className="nav-link-custom">
                  Portfolio
                </a>
              </li>

              <li className="nav-item">
                <a href="/" className="nav-link-custom">
                  Contact Us
                </a>
              </li>

              <li className="nav-item ms-lg-3">
                <a href="/" className="login-btn">
                  Login
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <style>{`
        .navbar-wrapper {
          position: fixed;
          top: 20px;
          left: 0;
          width: 100%;
          z-index: 9999;
          padding: 0 20px;
        }

        .navbar-container {
          max-width: 1400px;
          margin: auto;

          background: #111827;

          border-radius: 24px;

          border: 1px solid rgba(255,255,255,0.08);

          padding: 14px 24px;

          box-shadow:
            0 15px 40px rgba(0,0,0,0.25);
        }

        .navbar-brand-custom {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo-img {
          width: 55px;
          height: 55px;
          object-fit: contain;
          background: white;
          border-radius: 50%;
          padding: 4px;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .brand-primary {
          color: white;
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        .brand-secondary {
          color: #22c55e;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .custom-nav {
          align-items: center;
          gap: 8px;
        }

        .nav-link-custom {
          position: relative;

          color: #ffffff !important;

          text-decoration: none;

          font-size: 1rem;

          font-weight: 700;

          padding: 12px 14px;

          display: inline-block;

          transition: all .3s ease;
        }

        .nav-link-custom:hover {
          color: #22c55e !important;
        }

        .nav-link-custom::after {
          content: "";

          position: absolute;

          left: 14px;
          bottom: 6px;

          width: 0;

          height: 3px;

          border-radius: 20px;

          background: #22c55e;

          transition: width .3s ease;
        }

        .nav-link-custom:hover::after,
        .nav-link-custom.active::after {
          width: calc(100% - 28px);
        }

        .active {
          color: #22c55e !important;
        }

        .login-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          background: linear-gradient(
            135deg,
            #16a34a,
            #22c55e
          );

          color: white !important;

          text-decoration: none;

          font-weight: 800;

          padding: 12px 28px;

          border-radius: 999px;

          transition: all .3s ease;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          color: white;
        }

        .custom-toggler {
          border: none;
          color: white;
          font-size: 1.4rem;
        }

        .custom-toggler:focus {
          box-shadow: none;
        }

        @media (max-width: 991px) {

          .navbar-collapse {
            margin-top: 20px;

            background: #111827;

            border-radius: 16px;

            padding: 12px;
          }

          .custom-nav {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .nav-link-custom {
            width: 100%;
          }

          .login-btn {
            width: 100%;
            margin-top: 10px;
          }

          .brand-secondary {
            display: none;
          }
        }

        @media (max-width: 576px) {

          .navbar-wrapper {
            padding: 0 10px;
          }

          .logo-img {
            width: 48px;
            height: 48px;
          }

          .brand-primary {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default NavbarComponent;