import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FaPaintBrush,
  FaGlobe,
  FaVideo,
  FaNetworkWired,
  FaIdBadge,
  FaLaptopMedical,
  FaArrowRight,
} from "react-icons/fa";

const ServiceListComponent = () => {
  const shouldReduceMotion = useReducedMotion();

  const services = [
    {
      name: "Graphic Design",
      description:
        "Create visually compelling designs for digital and print media. From logos and brand identity to marketing materials and illustrations, we transform ideas into impactful visuals.",
      icon: FaPaintBrush,
    },
    {
      name: "Online Services",
      description:
        "Expand your digital presence with professional website development, e-commerce solutions, SEO optimization, and digital marketing strategies tailored for growth.",
      icon: FaGlobe,
    },
    {
      name: "CCTV Installation",
      description:
        "Protect your business and property with modern surveillance systems featuring professional installation, configuration, monitoring, and maintenance services.",
      icon: FaVideo,
    },
    {
      name: "Network Installation",
      description:
        "Build a reliable and secure network infrastructure with expert router, switch, wireless, and enterprise connectivity solutions for seamless operations.",
      icon: FaNetworkWired,
    },
    {
      name: "Branding",
      description:
        "Develop a powerful and memorable brand identity through strategic positioning, logo creation, visual systems, and cohesive brand communication.",
      icon: FaIdBadge,
    },
    {
      name: "Computer Maintenance",
      description:
        "Maximize system performance with proactive maintenance, troubleshooting, software updates, security checks, repairs, and technical support services.",
      icon: FaLaptopMedical,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
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
      <section className="services-section">
        <div className="bg-orb orb-left"></div>
        <div className="bg-orb orb-right"></div>

        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-badge">
              PROFESSIONAL BUSINESS SOLUTIONS
            </span>

            <h2 className="section-title">
              Our <span>Services</span>
            </h2>

            <p className="section-description">
              We provide innovative technology, branding, networking, and
              digital solutions designed to help businesses operate efficiently,
              strengthen their brand presence, and achieve sustainable growth.
            </p>
          </motion.div>

          <motion.div
            className="services-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <motion.article
                  key={service.name}
                  variants={cardVariants}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: -10,
                          scale: 1.02,
                        }
                  }
                  className="service-card"
                >
                  <div className="card-glow"></div>

                  <motion.div
                    className="icon-wrapper"
                    whileHover={
                      shouldReduceMotion
                        ? {}
                        : {
                            scale: 1.1,
                            rotate: 5,
                          }
                    }
                  >
                    <Icon size={30} />
                  </motion.div>

                  <h3>{service.name}</h3>

                  <p>{service.description}</p>

                  <a href="/" className="service-link">
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
        .services-section {
          position: relative;
          overflow: hidden;
          padding: 100px 20px;
          background: linear-gradient(
            180deg,
            #ffffff 0%,
            #f8fffb 50%,
            #ffffff 100%
          );
        }

        .container {
          max-width: 1400px;
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
          color: #0f172a;
          margin-bottom: 20px;
        }

        .section-title span {
          background: linear-gradient(135deg, #009b55, #19c37d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-description {
          font-size: 1.1rem;
          color: #64748b;
          line-height: 1.8;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .service-card {
          position: relative;
          padding: 35px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow:
            0 12px 30px rgba(15, 23, 42, 0.06),
            0 10px 40px rgba(0, 155, 85, 0.08);
          overflow: hidden;
          transition: all 0.35s ease;
        }

        .service-card:hover {
          box-shadow:
            0 25px 60px rgba(15, 23, 42, 0.12),
            0 10px 35px rgba(0, 155, 85, 0.18);
        }

        .card-glow {
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

        .service-card:hover .card-glow {
          opacity: 1;
        }

        .icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #009b55, #19c37d);
          color: #ffffff;
          box-shadow: 0 15px 35px rgba(0, 155, 85, 0.3);
        }

        .service-card h3 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 15px;
        }

        .service-card p {
          color: #64748b;
          line-height: 1.8;
          margin-bottom: 24px;
        }

        .service-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #009b55;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .service-link:hover {
          color: #007c45;
          transform: translateX(5px);
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

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.25;
          pointer-events: none;
        }

        .orb-left {
          width: 350px;
          height: 350px;
          background: #19c37d;
          top: -120px;
          left: -120px;
        }

        .orb-right {
          width: 450px;
          height: 450px;
          background: #009b55;
          bottom: -180px;
          right: -180px;
        }

        @media (max-width: 768px) {
          .services-section {
            padding: 70px 15px;
          }

          .services-grid {
            grid-template-columns: 1fr;
          }

          .service-card {
            padding: 25px;
          }

          .section-description {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default ServiceListComponent;