import React from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  FaMoneyBillWave,
  FaUniversity,
  FaBookOpen,
  FaClock,
  FaCashRegister,
  FaBitcoin,
  FaHandHoldingUsd,
  FaBuilding,
} from "react-icons/fa";

const ProductListComponent = () => {
  const shouldReduceMotion = useReducedMotion();

  const products = [
    {
      title: "Internet Billing System",
      icon: FaMoneyBillWave,
      features: [
        "Automated Customer Billing",
        "Bandwidth Monitoring",
        "Online Payments Integration",
        "Subscription Management",
        "Invoice & Receipt Generation",
      ],
    },

    {
      title: "School Fees Management",
      icon: FaUniversity,
      features: [
        "Student Fee Tracking",
        "Mpesa & Bank Integration",
        "Automated Receipts",
        "Fee Balance Management",
        "Financial Reports & Analytics",
      ],
    },

    {
      title: "School Academics System",
      icon: FaBookOpen,
      features: [
        "Student Academic Records",
        "Exam & Grading Management",
        "Attendance Tracking",
        "Timetable Scheduling",
        "Parent & Teacher Portal",
      ],
    },

    {
      title: "Property Management System",
      icon: FaBuilding,
      features: [
        "Tenant Management",
        "Rent Collection & Billing",
        "Lease Agreement Tracking",
        "Maintenance Requests",
        "Property Financial Reports",
      ],
    },

    {
      title: "Time Tabling Software",
      icon: FaClock,
      features: [
        "Automated Timetable Generation",
        "Conflict Detection",
        "Class Scheduling",
        "Teacher Allocation",
        "Printable Timetables",
      ],
    },

    {
      title: "Point Of Sale System",
      icon: FaCashRegister,
      features: [
        "Sales & Inventory Management",
        "Barcode Scanning",
        "Multi-Branch Support",
        "Customer Purchase Tracking",
        "Business Reporting Dashboard",
      ],
    },

    {
      title: "Visa POS To Crypto System",
      icon: FaBitcoin,
      features: [
        "Crypto Wallet Integration",
        "Visa POS Processing",
        "Secure Transactions",
        "Real-Time Currency Conversion",
        "Digital Payment Analytics",
      ],
    },

    {
      title: "Shylock Lending System",
      icon: FaHandHoldingUsd,
      features: [
        "Loan Processing Workflow",
        "Repayment Scheduling",
        "Customer Loan Tracking",
        "Interest Calculation",
        "Financial Reports & Insights",
      ],
    },
  ];

  return (
    <>
      <section className="software-products-section">
        {/* GLOW EFFECTS */}
        <div className="bg-glow glow-left"></div>
        <div className="bg-glow glow-right"></div>

        <div className="container">
          {/* HEADER */}
          <motion.div
            className="section-header"
            initial={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : 40,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">
              IKONEX SOFTWARE PRODUCTS
            </span>

            <h2 className="section-title">
              Enterprise Software
              <span> Solutions</span>
            </h2>

            <p className="section-description">
              Modern enterprise-grade systems designed to automate
              business operations, improve efficiency and accelerate
              digital transformation using secure and scalable
              technologies.
            </p>
          </motion.div>

          {/* PRODUCTS */}
          <div className="products-grid">
            {products.map((product, index) => {
              const Icon = product.icon;

              return (
                <motion.div
                  key={index}
                  className="product-card"
                  initial={{
                    opacity: 0,
                    y: shouldReduceMotion ? 0 : 45,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.08,
                  }}
                  viewport={{ once: true }}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                  }}
                >
                  {/* TOP */}
                  <div className="card-top">
                    <div className="icon-box">
                      <Icon />
                    </div>

                    <span className="card-badge">
                      ENTERPRISE READY
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="card-content">
                    <h3>{product.title}</h3>

                    <div className="divider"></div>

                    <ul>
                      {product.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>

                    <button className="learn-btn">
                      Learn More
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <style>{`
          .software-products-section {
            position: relative;

            overflow: hidden;

            padding: 120px 24px;

            background: linear-gradient(
              180deg,
              #02130a 0%,
              #052e16 45%,
              #02130a 100%
            );
          }

          .container {
            max-width: 1320px;

            margin: auto;

            position: relative;

            z-index: 2;
          }

          .bg-glow {
            position: absolute;

            border-radius: 50%;

            filter: blur(120px);

            opacity: 0.2;
          }

          .glow-left {
            width: 340px;
            height: 340px;

            background: #22c55e;

            top: 120px;
            left: -120px;
          }

          .glow-right {
            width: 420px;
            height: 420px;

            background: #16a34a;

            bottom: -180px;
            right: -120px;
          }

          .section-header {
            text-align: center;

            max-width: 850px;

            margin: 0 auto 90px;
          }

          .section-tag {
            display: inline-block;

            padding: 10px 20px;

            border-radius: 999px;

            background: rgba(34,197,94,0.12);

            border: 1px solid rgba(74,222,128,0.2);

            color: #bbf7d0;

            font-size: 0.82rem;

            font-weight: 800;

            letter-spacing: 0.12em;

            margin-bottom: 24px;
          }

          .section-title {
            font-size: clamp(2.8rem, 6vw, 4.8rem);

            font-weight: 900;

            line-height: 1.1;

            color: #ffffff;

            margin-bottom: 22px;
          }

          .section-title span {
            background: linear-gradient(
              135deg,
              #4ade80,
              #22c55e
            );

            -webkit-background-clip: text;

            -webkit-text-fill-color: transparent;
          }

          .section-description {
            color: #d1fae5;

            font-size: 1.08rem;

            line-height: 1.9;
          }

          .products-grid {
            display: grid;

            grid-template-columns: repeat(
              auto-fit,
              minmax(320px, 1fr)
            );

            gap: 32px;
          }

          .product-card {
            position: relative;

            overflow: hidden;

            border-radius: 30px;

            background: linear-gradient(
              180deg,
              rgba(6, 78, 59, 0.95) 0%,
              rgba(5, 46, 22, 0.96) 100%
            );

            border: 1px solid rgba(74,222,128,0.12);

            transition: all 0.35s ease;

            box-shadow:
              0 18px 40px rgba(0,0,0,0.28),
              0 0 30px rgba(34,197,94,0.05);

            backdrop-filter: blur(10px);
          }

          .product-card:hover {
            border-color: rgba(74,222,128,0.28);

            box-shadow:
              0 28px 65px rgba(0,0,0,0.4),
              0 0 40px rgba(34,197,94,0.15);
          }

          .card-top {
            display: flex;

            align-items: center;

            justify-content: space-between;

            padding: 28px 28px 16px;
          }

          .icon-box {
            width: 70px;

            height: 70px;

            border-radius: 20px;

            background: linear-gradient(
              135deg,
              #22c55e,
              #16a34a
            );

            display: flex;

            align-items: center;

            justify-content: center;

            color: white;

            font-size: 1.7rem;

            box-shadow:
              0 15px 35px rgba(34,197,94,0.35);

            transition: all 0.3s ease;
          }

          .product-card:hover .icon-box {
            transform: scale(1.08) rotate(5deg);
          }

          .card-badge {
            padding: 8px 14px;

            border-radius: 999px;

            background: rgba(255,255,255,0.08);

            color: #bbf7d0;

            font-size: 0.7rem;

            font-weight: 700;

            letter-spacing: 0.08em;
          }

          .card-content {
            padding: 0 28px 32px;
          }

          .card-content h3 {
            font-size: 1.7rem;

            font-weight: 800;

            line-height: 1.3;

            color: #ffffff;

            margin-bottom: 18px;
          }

          .divider {
            width: 70px;

            height: 4px;

            border-radius: 999px;

            background: linear-gradient(
              90deg,
              #22c55e,
              #4ade80
            );

            margin-bottom: 24px;
          }

          .card-content ul {
            list-style: none;

            padding: 0;

            margin: 0 0 32px 0;
          }

          .card-content li {
            position: relative;

            padding-left: 24px;

            margin-bottom: 16px;

            color: #ecfdf5;

            font-size: 0.98rem;

            line-height: 1.7;
          }

          .card-content li::before {
            content: "";

            position: absolute;

            left: 0;
            top: 10px;

            width: 9px;
            height: 9px;

            border-radius: 50%;

            background: #4ade80;

            box-shadow:
              0 0 10px rgba(74,222,128,0.8);
          }

          .learn-btn {
            width: 100%;

            border: none;

            padding: 15px 18px;

            border-radius: 16px;

            background: linear-gradient(
              135deg,
              #16a34a,
              #22c55e
            );

            color: white;

            font-size: 0.96rem;

            font-weight: 700;

            cursor: pointer;

            transition: all 0.3s ease;

            box-shadow:
              0 10px 25px rgba(34,197,94,0.2);
          }

          .learn-btn:hover {
            transform: translateY(-2px);

            box-shadow:
              0 18px 40px rgba(34,197,94,0.35);
          }

          @media (max-width: 768px) {

            .software-products-section {
              padding: 90px 14px;
            }

            .products-grid {
              grid-template-columns: 1fr;
            }

            .section-title {
              font-size: 2.6rem;
            }

            .section-description {
              font-size: 1rem;
            }

            .card-content {
              padding: 0 24px 28px;
            }

            .card-content h3 {
              font-size: 1.45rem;
            }

            .card-top {
              padding: 24px 24px 14px;
            }
          }
        `}</style>
      </section>
    </>
  );
};

export default ProductListComponent;