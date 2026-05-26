import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FaGlobe,
  FaMobileAlt,
  FaCode,
  FaArrowRight,
} from "react-icons/fa";

const SoftwareComponent = () => {
  const shouldReduceMotion = useReducedMotion();

  const developmentServices = [
    {
      name: "Web Development",
      description:
        "Create modern, fast, and responsive websites tailored to your business needs. We develop scalable front-end and back-end solutions using industry-leading technologies and best practices.",
      icon: FaGlobe,
    },
    {
      name: "Mobile Development",
      description:
        "Build intuitive and high-performance mobile applications for Android and iOS. Our solutions deliver seamless user experiences through native and cross-platform technologies.",
      icon: FaMobileAlt,
    },
    {
      name: "Software Development",
      description:
        "Transform business processes with custom software solutions. We design and develop enterprise systems, desktop applications, automation tools, and business management platforms.",
      icon: FaCode,
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
      <section className="software-section">
        <div className="bg-blur blur-left"></div>
        <div className="bg-blur blur-right"></div>

        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-badge">
              DIGITAL TRANSFORMATION SOLUTIONS
            </span>

            <h2 className="section-title">
              Software <span>Development</span>
            </h2>

            <p className="section-description">
              We build innovative digital products and enterprise-grade software
              solutions that help organizations streamline operations, improve
              efficiency, and accelerate business growth.
            </p>
          </motion.div>

          <motion.div
            className="software-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {developmentServices.map((service, index) => {
              const Icon = service.icon;

              return (
                <motion.article
                  key={service.name}
                  className="software-card"
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
                  <div className="card-highlight"></div>

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
                    <Icon size={34} />
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
      </section>

      <style>{`
        .software-section {
          position: relative;
          overflow: hidden;
          padding: 110px 20px;
          background: linear-gradient(
            180deg,
            #ffffff 0%,
            #f8fffb 50%,
            #ffffff 100%
          );
        }

        .container {
          max-width: 1350px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
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
          background: rgba(0, 155, 85, 0.12);
          color: #009b55;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 20px;
          color: #0f172a;
        }

        .section-title span {
          background: linear-gradient(135deg, #009b55, #19c37d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-description {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #64748b;
        }

        .software-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 28px;
        }

        .software-card {
          position: relative;
          padding: 40px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow:
            0 12px 35px rgba(15, 23, 42, 0.06),
            0 10px 40px rgba(0, 155, 85, 0.08);
          overflow: hidden;
          transition: all 0.35s ease;
        }

        .software-card:hover {
          box-shadow:
            0 25px 60px rgba(15, 23, 42, 0.12),
            0 15px 40px rgba(0, 155, 85, 0.18);
        }

        .card-highlight {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            135deg,
            rgba(0, 155, 85, 0.08),
            rgba(25, 195, 125, 0.02)
          );
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .software-card:hover .card-highlight {
          opacity: 1;
        }

        .icon-wrapper {
          width: 85px;
          height: 85px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 24px;
          background: linear-gradient(135deg, #009b55, #19c37d);
          color: white;
          margin-bottom: 25px;
          box-shadow: 0 15px 35px rgba(0, 155, 85, 0.35);
        }

        .software-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 15px;
        }

        .software-card p {
          color: #64748b;
          line-height: 1.8;
          margin-bottom: 25px;
        }

        .learn-more {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #009b55;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .learn-more:hover {
          transform: translateX(5px);
          color: #007c45;
        }

        .card-number {
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 3rem;
          font-weight: 800;
          color: rgba(15, 23, 42, 0.05);
          user-select: none;
        }

        .bg-blur {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.25;
          pointer-events: none;
        }

        .blur-left {
          width: 350px;
          height: 350px;
          background: #19c37d;
          top: -100px;
          left: -120px;
        }

        .blur-right {
          width: 450px;
          height: 450px;
          background: #009b55;
          bottom: -180px;
          right: -180px;
        }

        @media (max-width: 768px) {
          .software-section {
            padding: 80px 15px;
          }

          .software-grid {
            grid-template-columns: 1fr;
          }

          .software-card {
            padding: 28px;
          }

          .section-description {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default SoftwareComponent;