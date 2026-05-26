import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FaEnvelope,
  FaFileInvoiceDollar,
  FaUserCog,
  FaGraduationCap,
  FaCar,
  FaTruck,
  FaUserTie,
  FaMoneyCheckAlt,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";

const OnlineServices = () => {
  const shouldReduceMotion = useReducedMotion();

  const onlineServices = [
    {
      name: "Email Services",
      description:
        "Professional email setup, configuration, migration, and support services for businesses and institutions.",
      icon: FaEnvelope,
    },
    {
      name: "KRA Services",
      description:
        "Assistance with KRA PIN registration, tax returns filing, compliance services, and online tax management.",
      icon: FaFileInvoiceDollar,
    },
    {
      name: "eCitizen Services",
      description:
        "Application support for passports, certificates, permits, business registration, and other eCitizen services.",
      icon: FaUserCog,
    },
    {
      name: "KUCCPS Services",
      description:
        "Student placement support, application guidance, course revisions, and institution selection assistance.",
      icon: FaGraduationCap,
    },
    {
      name: "NTSA Services",
      description:
        "Vehicle registration, driving license applications, transfers, renewals, and transport compliance support.",
      icon: FaCar,
    },
    {
      name: "TIMS Services",
      description:
        "Access transport-related services including vehicle inspection bookings, ownership transfers, and licensing.",
      icon: FaTruck,
    },
    {
      name: "GHRIS Services",
      description:
        "Government employee account management, profile updates, payroll access, and HR-related support.",
      icon: FaUserTie,
    },
    {
      name: "Payslip Services",
      description:
        "Secure access, retrieval, printing, and management of government employee payslips and payroll records.",
      icon: FaMoneyCheckAlt,
    },
    {
      name: "CRB Services",
      description:
        "Credit report checks, clearance certificate applications, dispute resolution, and financial advisory support.",
      icon: FaChartLine,
    },
    {
      name: "HELB Services",
      description:
        "Loan applications, compliance certificates, repayment guidance, account management, and support services.",
      icon: FaGraduationCap,
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 25,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
      },
    },
  };

  return (
    <>
      <section className="online-services-section">
        <div className="bg-glow glow-left"></div>
        <div className="bg-glow glow-right"></div>

        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">
              DIGITAL & GOVERNMENT SERVICES
            </span>

            <h2 className="section-title">
              Online <span>Services</span>
            </h2>

            <p className="section-description">
              Convenient access to essential online, government, educational,
              transport, tax, and financial services delivered efficiently by
              our experienced support team.
            </p>
          </motion.div>

          <motion.div
            className="services-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {onlineServices.map((service, index) => {
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
                  <div className="card-overlay"></div>

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
                    <Icon size={28} />
                  </motion.div>

                  <h3>{service.name}</h3>

                  <p>{service.description}</p>

                  <a href="/" className="learn-more">
                    Learn More
                    <FaArrowRight />
                  </a>

                  <span className="card-index">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <style>{`
        .online-services-section {
          position: relative;
          overflow: hidden;
          padding: 110px 20px;
          background: linear-gradient(
            180deg,
            #0f172a 0%,
            #111827 50%,
            #0f172a 100%
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
          color: #94a3b8;
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
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
          transition: all 0.35s ease;
        }

        .service-card:hover {
          border-color: rgba(25, 195, 125, 0.25);
          box-shadow: 0 20px 50px rgba(25, 195, 125, 0.12);
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(25, 195, 125, 0.06),
            transparent
          );
          opacity: 0;
          transition: 0.35s;
        }

        .service-card:hover .card-overlay {
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
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 14px;
        }

        .service-card p {
          color: #94a3b8;
          line-height: 1.8;
          margin-bottom: 24px;
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

        .card-index {
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 3rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.04);
        }

        .bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.2;
        }

        .glow-left {
          width: 350px;
          height: 350px;
          background: #19c37d;
          top: -100px;
          left: -100px;
        }

        .glow-right {
          width: 450px;
          height: 450px;
          background: #009b55;
          bottom: -150px;
          right: -150px;
        }

        @media (max-width: 768px) {
          .online-services-section {
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

export default OnlineServices;