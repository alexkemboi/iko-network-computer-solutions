import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import OnlineServices from "../OnlineServices/OnlineServices"
import {
  FaPrint,
  FaCopy,
  FaFileAlt,
  FaBook,
  FaArrowRight,
} from "react-icons/fa";
// import headerImage from "../../images/header.png";

const Cyber = () => {
  const shouldReduceMotion = useReducedMotion();

  const cyberServices = [
    {
      name: "Printing",
      description:
        "Professional high-quality printing services for documents, brochures, business cards, flyers, reports, and promotional materials.",
      icon: FaPrint,
    },
    {
      name: "Photocopy",
      description:
        "Fast and reliable photocopy services with crystal-clear black & white and full-color reproduction for all document types.",
      icon: FaCopy,
    },
    {
      name: "Scanning",
      description:
        "Convert physical documents into secure digital formats with high-resolution scanning and document archiving services.",
      icon: FaFileAlt,
    },
    {
      name: "Lamination & Binding",
      description:
        "Protect important documents with premium lamination and create professional presentations using various binding options.",
      icon: FaBook,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <>
      <section
        className="cyber-section"
        // style={{
        //   backgroundImage: `url(${headerImage})`,
        // }}
      >
        {/* Top Border */}
        <div className="section-border top-border"></div>

        <div className="overlay"></div>

        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">DIGITAL DOCUMENT SOLUTIONS</span>

            <h2 className="section-title">
               <span>Cyber Services</span>
            </h2>

            <p className="section-description">
              Fast, reliable, and professional cyber services designed to meet
              your personal, academic, and business document processing needs.
            </p>
          </motion.div>

          <motion.div
            className="services-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {cyberServices.map((service, index) => {
              const Icon = service.icon;

              return (
                <motion.article
                  key={service.name}
                  className="service-card"
                  variants={cardVariants}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: -10,
                          scale: 1.02,
                        }
                  }
                >
                  <div className="card-glow"></div>

                  <motion.div
                    className="icon-wrapper"
                    whileHover={
                      shouldReduceMotion
                        ? {}
                        : {
                            rotate: 5,
                            scale: 1.1,
                          }
                    }
                  >
                    <Icon size={30} />
                  </motion.div>

                  <h3>{service.name}</h3>

                  <p>{service.description}</p>

                  <a href="/" className="learn-more">
                    Learn More
                    <FaArrowRight />
                  </a>

                  <span className="card-number">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                </motion.article>
              );
            })}
          </motion.div>
            
        </div>
        {/* Bottom Border */}
        <div className="section-border bottom-border"></div>
      </section>
        <OnlineServices/>

      <style>{`
        .cyber-section {
          position: relative;
          padding: 110px 20px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          overflow: hidden;
        }

        .overlay {
          position: absolute;
          inset: 0;
               background: linear-gradient(
            180deg,
            #0f172a 0%,
            #111827 50%,
            #0f172a 100%
          );
        }

        .container {
          position: relative;
          z-index: 2;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          max-width: 850px;
          margin: 0 auto 70px;
        }

        .section-badge {
          display: inline-block;
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(25, 195, 125, 0.15);
          color: #34d399;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 20px;
        }

        .section-title span {
          background: linear-gradient(135deg, #19c37d, #34d399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-description {
          color: #cbd5e1;
          line-height: 1.8;
          font-size: 1.1rem;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
        }

        .service-card {
          position: relative;
          padding: 32px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          transition: all 0.35s ease;
        }

        .service-card:hover {
          border-color: rgba(25, 195, 125, 0.3);
          box-shadow: 0 20px 50px rgba(25, 195, 125, 0.15);
        }

        .card-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(25, 195, 125, 0.08),
            transparent
          );
          opacity: 0;
          transition: 0.35s ease;
        }

        .service-card:hover .card-glow {
          opacity: 1;
        }

        .icon-wrapper {
          width: 75px;
          height: 75px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #009b55, #19c37d);
          color: white;
          margin-bottom: 22px;
          box-shadow: 0 15px 35px rgba(25, 195, 125, 0.25);
        }

        .service-card h3 {
          color: #ffffff;
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 15px;
        }

        .service-card p {
          color: #cbd5e1;
          line-height: 1.8;
          margin-bottom: 22px;
        }

        .learn-more {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #34d399;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .learn-more:hover {
          transform: translateX(5px);
          color: #6ee7b7;
        }

        .card-number {
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 3rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.04);
        }

        .section-border {
          position: absolute;
          left: 0;
          width: 100%;
          height: 5px;
          background: linear-gradient(
            90deg,
            transparent,
            #19c37d,
            #34d399,
            #19c37d,
            transparent
          );
          z-index: 5;
        }

        .top-border {
          top: 0;
        }

        .bottom-border {
          bottom: 0;
        }

        @media (max-width: 768px) {
          .cyber-section {
            padding: 80px 15px;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .service-card {
            padding: 24px;
          }
        }
      `}</style>
    </>
  );
};

export default Cyber;