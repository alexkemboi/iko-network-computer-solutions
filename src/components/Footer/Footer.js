import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

const Footer = () => {
  return (
    <>
      <footer className="footer-section">
        <div className="footer-top-border"></div>

        <div className="container">
          <div className="row gy-5">
            {/* Company Info */}
            <div className="col-lg-4 col-md-6">
              <div className="footer-brand">
                <h3>IKONEX SYSTEMS</h3>

                <p>
                  Delivering innovative software solutions, cyber services,
                  networking, branding, web development, and technology
                  consulting services that empower businesses to thrive in the
                  digital era.
                </p>

                <div className="contact-info">
                  <div>
                    <FaMapMarkerAlt />
                    <span>Nairobi, Kenya</span>
                  </div>

                  <div>
                    <FaPhoneAlt />
                    <span>+254 787 088 567</span>
                  </div>

                  <div>
                    <FaEnvelope />
                    <span>info@ikonexsystems.com</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="col-lg-2 col-md-6">
              <h5>Services</h5>

              <ul>
                <li>
                  <a href="/">Cyber Services</a>
                </li>
                <li>
                  <a href="/">Software Development</a>
                </li>
                <li>
                  <a href="/">Online Services</a>
                </li>
                <li>
                  <a href="/">Computer Solutions</a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="col-lg-2 col-md-6">
              <h5>Resources</h5>

              <ul>
                <li>
                  <a href="/">Support Center</a>
                </li>
                <li>
                  <a href="/">Developers</a>
                </li>
                <li>
                  <a href="/">Documentation</a>
                </li>
                <li>
                  <a href="/">System Status</a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="col-lg-2 col-md-6">
              <h5>Company</h5>

              <ul>
                <li>
                  <a href="/">About Us</a>
                </li>
                <li>
                  <a href="/">Portfolio</a>
                </li>
                <li>
                  <a href="/">Contact</a>
                </li>
                <li>
                  <a href="/">Careers</a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div className="col-lg-2 col-md-6">
              <h5>Connect</h5>

              <div className="social-links">
                <a href="/">
                  <FaFacebookF />
                </a>

                <a href="/">
                  <FaTwitter />
                </a>

                <a href="/">
                  <FaInstagram />
                </a>

                <a href="/">
                  <FaLinkedinIn />
                </a>

                <a href="/">
                  <FaGithub />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="footer-bottom">
            <p>
              © {new Date().getFullYear()} IKONEX Systems. All rights reserved.
            </p>

            <div className="footer-bottom-links">
              <a href="/">Privacy Policy</a>
              <a href="/">Terms of Service</a>
              <a href="/">SLA</a>
            </div>
          </div>
        </div>

        <style>{`
          .footer-section {
            position: relative;
            background: #0f172a;
            color: #ffffff;
            padding: 80px 20px 25px;
            overflow: hidden;
          }

          .footer-top-border {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;

            background: linear-gradient(
              90deg,
              transparent,
              #009b55,
              #34d399,
              #009b55,
              transparent
            );
          }

          .footer-section .container {
            max-width: 1320px;
            margin: 0 auto;
          }

          .footer-brand h3 {
            color: #34d399;
            font-size: 1.8rem;
            font-weight: 800;
            margin-bottom: 20px;
          }

          .footer-brand p {
            color: #cbd5e1;
            line-height: 1.9;
            margin-bottom: 25px;
          }

          .contact-info div {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
            color: #d1d5db;
          }

          .contact-info svg {
            color: #34d399;
          }

          h5 {
            color: #ffffff;
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 20px;
          }

          ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          ul li {
            margin-bottom: 12px;
          }

          ul li a {
            color: #cbd5e1;
            text-decoration: none;
            transition: all 0.3s ease;
          }

          ul li a:hover {
            color: #34d399;
            padding-left: 5px;
          }

          .social-links {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .social-links a {
            width: 42px;
            height: 42px;
            border-radius: 12px;

            display: flex;
            align-items: center;
            justify-content: center;

            background: rgba(255,255,255,0.08);

            color: #ffffff;

            transition: all 0.3s ease;
          }

          .social-links a:hover {
            background: #009b55;
            transform: translateY(-4px);
          }

          .footer-bottom {
            border-top: 1px solid rgba(255,255,255,0.1);

            margin-top: 50px;
            padding-top: 25px;

            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
          }

          .footer-bottom p {
            margin: 0;
            color: #94a3b8;
          }

          .footer-bottom-links {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
          }

          .footer-bottom-links a {
            color: #94a3b8;
            text-decoration: none;
            transition: color 0.3s ease;
          }

          .footer-bottom-links a:hover {
            color: #34d399;
          }

          @media (max-width: 768px) {
            .footer-section {
              padding: 60px 15px 20px;
            }

            .footer-bottom {
              flex-direction: column;
              text-align: center;
            }

            .social-links {
              justify-content: center;
            }
          }
        `}</style>
      </footer>
    </>
  );
};

export default Footer;