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

        {/* Decorative Borders */}
        <div className="hero-top-border"></div>
        <div className="hero-bottom-border"></div>

        <div className="container py-5 px-lg-5">
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
            transition={{ duration: 0.6 }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="service-item"
                whileHover={{
                  y: -6,
                }}
              >
                <div className="service-icon">
                  {service.icon}
                </div>

                <h6>{service.title}</h6>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <style>{`
          .hero-section {
            position: relative;
            overflow: hidden;

            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;

            max-width: 1400px;

            margin: 120px auto 80px auto;

            border-radius: 32px;

            border: 1px solid rgba(255,255,255,0.15);

            box-shadow:
              0 25px 60px rgba(15,23,42,0.15),
              0 10px 30px rgba(0,155,85,0.08);
          }

          .hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              135deg,
              rgba(15,23,42,0.95),
              rgba(15,23,42,0.88)
            );
          }

          .hero-top-border,
          .hero-bottom-border {
            position: absolute;
            left: 0;
            width: 100%;
            height: 5px;
            z-index: 5;

            background: linear-gradient(
              90deg,
              transparent,
              #009b55,
              #19c37d,
              #34d399,
              #19c37d,
              #009b55,
              transparent
            );
          }

          .hero-top-border {
            top: 0;
          }

          .hero-bottom-border {
            bottom: 0;
          }

          .container {
            position: relative;
            z-index: 2;
          }

          .hero-badge {
            display: inline-block;
            padding: 10px 20px;
            border-radius: 999px;

            background: rgba(25,195,125,.15);

            color: #34d399;

            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.15em;

            border: 1px solid rgba(52,211,153,.25);

            margin-bottom: 20px;
          }

          .hero-title {
            font-size: clamp(3rem, 6vw, 5rem);
            font-weight: 900;
            line-height: 1.05;
            color: #ffffff;
            margin-bottom: 25px;
          }

          .hero-title span {
            display: block;
            color: #34d399;
          }

          .hero-description {
            font-size: 1.15rem;
            line-height: 1.9;
            color: #d1d5db;
            margin-bottom: 35px;
            max-width: 600px;
          }

          .hero-actions {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            align-items: center;
          }

          .hero-btn {
            display: flex;
            align-items: center;
            gap: 10px;

            padding: 14px 30px;

            border-radius: 14px;

            font-weight: 700;

            box-shadow:
              0 10px 25px rgba(0,155,85,0.25);
          }

          .contact-btn {
            display: flex;
            align-items: center;
            gap: 10px;

            color: #ffffff;
            text-decoration: none;
            font-weight: 600;

            padding: 12px 18px;

            border-radius: 12px;

            background: rgba(255,255,255,0.08);

            border: 1px solid rgba(255,255,255,0.12);
          }

          .contact-btn:hover {
            color: #34d399;
            text-decoration: none;
          }

          .hero-image-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .hero-image {
            max-width: 95%;
            height: auto;

            animation: float 5s ease-in-out infinite;

            filter:
              drop-shadow(
                0 20px 40px rgba(0,0,0,0.25)
              );
          }

          @keyframes float {
            0%,100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-15px);
            }
          }

          .services-strip {
            margin-top: 50px;

            display: grid;
            grid-template-columns:
              repeat(auto-fit,minmax(220px,1fr));

            gap: 20px;
          }

          .service-item {
            background: rgba(255,255,255,0.08);

            backdrop-filter: blur(12px);

            border: 1px solid rgba(255,255,255,0.08);

            border-radius: 22px;

            padding: 24px;

            text-align: center;

            transition: all 0.3s ease;
          }

          .service-item:hover {
            border-color: rgba(52,211,153,0.3);

            box-shadow:
              0 15px 30px rgba(0,155,85,0.15);
          }

          .service-icon {
            width: 65px;
            height: 65px;

            margin: auto;
            margin-bottom: 15px;

            border-radius: 18px;

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

            box-shadow:
              0 10px 25px rgba(0,155,85,0.25);
          }

          .service-item h6 {
            color: #ffffff;
            font-size: 1rem;
            font-weight: 600;
            line-height: 1.6;
            margin: 0;
          }

          @media (max-width: 991px) {
            .hero-section {
              margin: 100px 15px 60px;
              border-radius: 24px;
            }

            .hero-title,
            .hero-description {
              text-align: center;
            }

            .hero-description {
              margin-left: auto;
              margin-right: auto;
            }

            .hero-actions {
              justify-content: center;
            }

            .hero-badge {
              display: table;
              margin-left: auto;
              margin-right: auto;
              margin-bottom: 20px;
            }

            .hero-image {
              margin-top: 40px;
            }
          }

          @media (max-width: 768px) {
            .hero-section {
              margin: 90px 12px 50px;
            }

            .hero-title {
              font-size: 2.8rem;
            }
              .hero-section {
              margin-top: 120px;
            }

            .hero-description {
              font-size: 1rem;
            }

            .services-strip {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </section>
    </>
  );
}

export default Home;