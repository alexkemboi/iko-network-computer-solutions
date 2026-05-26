import React from "react";
import { motion } from "framer-motion";
import {
  FaCode,
  FaPaintBrush,
  FaLaptopCode,
  FaLightbulb,
  FaArrowRight,
  FaPhoneAlt,
} from "react-icons/fa";

import backgroundImage from "../../images/header.jpg";
import softwareImage from "../../images/banner.png";

function Home() {
  const services = [
    {
      icon: <FaLaptopCode />,
      title: "Website & Software Development",
    },
    {
      icon: <FaCode />,
      title: "Cyber Services & Training",
    },
    {
      icon: <FaLightbulb />,
      title: "Research & Innovation",
    },
    {
      icon: <FaPaintBrush />,
      title: "Graphics Design & Branding",
    },
  ];

  return (
    <>
      <section
        className="hero-section"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="hero-overlay"></div>

        <div className="container">
          <div className="row align-items-center min-vh-100">
            {/* LEFT CONTENT */}
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="hero-badge">
                  IKONEX SYSTEMS
                </span>

                <h1 className="hero-title">
                  Website & Software
                  <span> Development Services</span>
                </h1>

                <p className="hero-description">
                  Empowering businesses through innovative software solutions,
                  website development, cyber services, branding, graphics
                  design, research, and digital transformation services.
                </p>

                <div className="hero-actions">
                  <a
                    href="#services"
                    className="btn btn-success btn-lg hero-btn"
                  >
                    Get Started
                    <FaArrowRight />
                  </a>

                  <a
                    href="tel:+254787088567"
                    className="contact-btn"
                  >
                    <FaPhoneAlt />
                    +254 787 088 567
                  </a>
                </div>
              </motion.div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="col-lg-6">
              <motion.div
                className="hero-image-wrapper"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <img
                  src={softwareImage}
                  alt="Website Development"
                  className="img-fluid hero-image"
                />
              </motion.div>
            </div>
          </div>

          {/* SERVICES STRIP */}
          <motion.div
            className="services-strip"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            {services.map((service, index) => (
              <div key={index} className="service-item">
                <div className="service-icon">
                  {service.icon}
                </div>

                <h6>{service.title}</h6>
              </div>
            ))}
          </motion.div>
        </div>

        <style>{`
          .hero-section {
            position: relative;
            background-size: cover;
            background-position: center;
            overflow: hidden;
          }

          .hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              135deg,
              rgba(15,23,42,0.92),
              rgba(15,23,42,0.82)
            );
          }

          .container {
            position: relative;
            z-index: 2;
          }

          .hero-badge {
            display: inline-block;
            padding: 10px 18px;
            border-radius: 999px;
            background: rgba(25,195,125,.15);
            color: #34d399;
            font-weight: 700;
            letter-spacing: .15em;
            margin-bottom: 20px;
          }

          .hero-title {
            font-size: clamp(3rem,6vw,5rem);
            font-weight: 900;
            line-height: 1.05;
            color: #fff;
            margin-bottom: 25px;
          }

          .hero-title span {
            display: block;
            background: linear-gradient(
              135deg,
              #19c37d,
              #34d399
            );
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .hero-description {
            font-size: 1.15rem;
            line-height: 1.9;
            color: #cbd5e1;
            margin-bottom: 35px;
          }

          .hero-actions {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
          }

          .hero-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            border-radius: 12px;
            padding: 14px 28px;
          }

          .contact-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            color: white;
            text-decoration: none;
            font-weight: 600;
          }

          .hero-image {
            animation: float 5s ease-in-out infinite;
          }

          @keyframes float {
            0%,100%{
              transform:translateY(0);
            }
            50%{
              transform:translateY(-15px);
            }
          }

          .services-strip {
            margin-top: 40px;
            display: grid;
            grid-template-columns:
              repeat(auto-fit,minmax(220px,1fr));
            gap: 20px;
          }

          .service-item {
            background: rgba(255,255,255,.08);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,.08);
            border-radius: 20px;
            padding: 20px;
            text-align: center;
          }

          .service-icon {
            width: 60px;
            height: 60px;
            margin: auto;
            margin-bottom: 15px;
            border-radius: 16px;
            background: linear-gradient(
              135deg,
              #009b55,
              #19c37d
            );
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
          }

          .service-item h6 {
            color: white;
            font-size: 1rem;
            margin: 0;
          }

          @media(max-width:991px){
            .hero-title{
              text-align:center;
            }

            .hero-description{
              text-align:center;
            }

            .hero-actions{
              justify-content:center;
            }
          }
        `}</style>
      </section>
    </>
  );
}

export default Home;