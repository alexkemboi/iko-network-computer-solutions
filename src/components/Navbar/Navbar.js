import React, { useEffect, useState } from "react";
import {
  FaBars,
  FaTimes,
} from "react-icons/fa";

import logo from "../../images/logo.png";

const NavbarComponent = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileMenuOpen]);

  // Close menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar-wrapper">
        <div className="navbar-container">
          {/* Logo */}
          <a href="/" className="navbar-brand-custom">
            <img
              src={logo}
              alt="IKONEX Logo"
              className="logo-img"
            />

            <div className="brand-text">
              <span className="brand-primary">
                IKONEX SYSTEMS
              </span>

              <span className="brand-secondary">
                TECHNOLOGY • SOFTWARE • CYBER • TRAINING
              </span>
            </div>
          </a>

          {/* Desktop Menu */}
          <div className="desktop-menu">
            <ul className="custom-nav">
              <li>
                <a href="/" className="nav-link-custom active">
                  About
                </a>
              </li>

              <li>
                <a href="/" className="nav-link-custom">
                  Software
                </a>
              </li>

              <li>
                <a href="/" className="nav-link-custom">
                  Cyber
                </a>
              </li>

              <li>
                <a href="/" className="nav-link-custom">
                  Computers
                </a>
              </li>

              <li>
                <a href="/" className="nav-link-custom">
                  Services
                </a>
              </li>

              <li>
                <a href="/" className="nav-link-custom">
                  Portfolio
                </a>
              </li>

              <li>
                <a href="/" className="nav-link-custom">
                  Contact
                </a>
              </li>

              <li>
                <a href="/" className="login-btn">
                  Login
                </a>
              </li>
            </ul>
          </div>

          {/* Mobile Toggle */}
          <button
            className="mobile-toggle"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes />
            ) : (
              <FaBars />
            )}
          </button>
        </div>
      </nav>

      {/* Overlay */}
      <div
        className={`mobile-overlay ${
          isMobileMenuOpen ? "show-overlay" : ""
        }`}
        onClick={closeMenu}
      ></div>

      {/* Mobile Sidebar */}
      <div
        className={`mobile-sidebar ${
          isMobileMenuOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="mobile-sidebar-header">
          <div className="mobile-brand">
            <img
              src={logo}
              alt="IKONEX Logo"
            />

            <span>IKONEX</span>
          </div>

          <button
            className="close-btn"
            onClick={closeMenu}
          >
            <FaTimes />
          </button>
        </div>

        <ul className="mobile-nav">
          <li>
            <a href="/" onClick={closeMenu}>
              About Us
            </a>
          </li>

          <li>
            <a href="/" onClick={closeMenu}>
              Software
            </a>
          </li>

          <li>
            <a href="/" onClick={closeMenu}>
              Cyber Services
            </a>
          </li>

          <li>
            <a href="/" onClick={closeMenu}>
              Computers
            </a>
          </li>

          <li>
            <a href="/" onClick={closeMenu}>
              Services
            </a>
          </li>

          <li>
            <a href="/" onClick={closeMenu}>
              Portfolio
            </a>
          </li>

          <li>
            <a href="/" onClick={closeMenu}>
              Contact Us
            </a>
          </li>
        </ul>

        <a
          href="/"
          className="mobile-login-btn"
          onClick={closeMenu}
        >
          Login
        </a>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

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

          display: flex;

          align-items: center;

          justify-content: space-between;

          padding: 14px 24px;

          border-radius: 24px;

          background: rgba(15, 23, 42, 0.95);

          backdrop-filter: blur(18px);

          border: 1px solid rgba(255,255,255,0.08);

          box-shadow:
            0 10px 40px rgba(0,0,0,0.22);
        }

        .navbar-brand-custom {
          display: flex;

          align-items: center;

          gap: 14px;

          text-decoration: none;

          min-width: fit-content;
        }

        .logo-img {
          width: 58px;
          height: 58px;

          border-radius: 50%;

          object-fit: contain;

          background: white;

          padding: 4px;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-primary {
          color: white;

          font-size: 1.35rem;

          font-weight: 900;

          letter-spacing: .5px;
        }

        .brand-secondary {
          color: #34d399;

          font-size: .75rem;

          font-weight: 700;

          letter-spacing: 1.5px;

          margin-top: 2px;
        }

        .desktop-menu {
          display: flex;
        }

        .custom-nav {
          display: flex;

          align-items: center;

          gap: 8px;

          list-style: none;

          margin: 0;

          padding: 0;
        }

        .nav-link-custom {
          position: relative;

          color: #ffffff;

          text-decoration: none;

          font-size: .96rem;

          font-weight: 700;

          padding: 12px 16px;

          border-radius: 12px;

          transition: all .3s ease;
        }

        .nav-link-custom:hover {
          color: #34d399;

          background: rgba(255,255,255,0.05);
        }

        .nav-link-custom::after {
          content: "";

          position: absolute;

          left: 16px;
          bottom: 7px;

          width: 0;

          height: 3px;

          background: #34d399;

          border-radius: 20px;

          transition: .3s ease;
        }

        .nav-link-custom:hover::after,
        .nav-link-custom.active::after {
          width: calc(100% - 32px);
        }

        .active {
          color: #34d399;
        }

        .login-btn {
          display: inline-flex;

          align-items: center;

          justify-content: center;

          padding: 12px 28px;

          border-radius: 999px;

          background: linear-gradient(
            135deg,
            #009b55,
            #19c37d
          );

          color: white;

          text-decoration: none;

          font-weight: 800;

          transition: all .3s ease;
        }

        .login-btn:hover {
          transform: translateY(-2px);

          box-shadow:
            0 10px 20px rgba(0,155,85,.25);
        }

        .mobile-toggle {
          display: none;

          background: transparent;

          border: none;

          color: white;

          font-size: 1.5rem;

          cursor: pointer;
        }

        .mobile-overlay {
          position: fixed;

          inset: 0;

          background: rgba(0,0,0,.45);

          backdrop-filter: blur(3px);

          opacity: 0;

          visibility: hidden;

          transition: .3s ease;

          z-index: 9997;
        }

        .show-overlay {
          opacity: 1;

          visibility: visible;
        }

        .mobile-sidebar {
          position: fixed;

          top: 0;
          right: -100%;

          width: 320px;

          max-width: 90%;

          height: 100vh;

          background: #0f172a;

          z-index: 9998;

          padding: 28px 24px;

          transition: right .35s ease;

          display: flex;

          flex-direction: column;
        }

        .sidebar-open {
          right: 0;
        }

        .mobile-sidebar-header {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-bottom: 40px;
        }

        .mobile-brand {
          display: flex;

          align-items: center;

          gap: 10px;
        }

        .mobile-brand img {
          width: 45px;
          height: 45px;

          border-radius: 50%;

          background: white;

          padding: 4px;
        }

        .mobile-brand span {
          color: white;

          font-weight: 800;

          font-size: 1.2rem;
        }

        .close-btn {
          background: transparent;

          border: none;

          color: white;

          font-size: 1.4rem;

          cursor: pointer;
        }

        .mobile-nav {
          list-style: none;

          padding: 0;

          margin: 0;

          display: flex;

          flex-direction: column;

          gap: 12px;
        }

        .mobile-nav li a {
          display: block;

          color: #ffffff;

          text-decoration: none;

          padding: 14px 16px;

          border-radius: 14px;

          background: rgba(255,255,255,0.04);

          font-weight: 700;

          transition: all .3s ease;
        }

        .mobile-nav li a:hover {
          background: rgba(52,211,153,.15);

          color: #34d399;

          transform: translateX(5px);
        }

        .mobile-login-btn {
          margin-top: auto;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 14px;

          border-radius: 16px;

          background: linear-gradient(
            135deg,
            #009b55,
            #19c37d
          );

          color: white;

          text-decoration: none;

          font-weight: 800;

          transition: .3s ease;
        }

        .mobile-login-btn:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 991px) {

          .desktop-menu {
            display: none;
          }

          .mobile-toggle {
            display: block;
          }

          .brand-secondary {
            display: none;
          }
        }

        @media (max-width: 576px) {

          .navbar-wrapper {
            padding: 0 10px;
          }

          .navbar-container {
            padding: 12px 18px;
          }

          .logo-img {
            width: 50px;
            height: 50px;
          }

          .brand-primary {
            font-size: 1rem;
          }

          .mobile-sidebar {
            width: 290px;
          }
        }
      `}</style>
    </>
  );
};

export default NavbarComponent;