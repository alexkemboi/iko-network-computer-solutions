import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FaLaptop,
  FaDesktop,
  FaKeyboard,
  FaPlug,
  FaMousePointer,
  FaTv,
  FaArrowRight,
} from "react-icons/fa";

const ProductListComponent = () => {
  const shouldReduceMotion = useReducedMotion();

  const products = [
    {
      name: "Laptops",
      description:
        "Explore our range of powerful and portable laptops. Perfect for work, entertainment, and on-the-go productivity with configurations tailored to every need.",
      icon: FaLaptop,
    },
    {
      name: "Desktops",
      description:
        "Reliable desktop computers engineered for performance, efficiency, and seamless multitasking in both home and professional environments.",
      icon: FaDesktop,
    },
    {
      name: "Monitors",
      description:
        "Immersive displays with stunning clarity and vibrant color accuracy, ideal for gaming, creative work, and productivity.",
      icon: FaTv,
    },
    {
      name: "Keyboards",
      description:
        "Premium mechanical and ergonomic keyboards designed to deliver comfort, precision, and exceptional typing experiences.",
      icon: FaKeyboard,
    },
    {
      name: "Cables",
      description:
        "High-quality HDMI, USB, power, and connectivity solutions built for durability, reliability, and fast data transmission.",
      icon: FaPlug,
    },
    {
      name: "Mouse",
      description:
        "Precision-engineered wired and wireless mice optimized for productivity, creativity, and high-performance gaming.",
      icon: FaMousePointer,
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
      <section className="product-section">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>

        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="section-tag">IKONEX TECHNOLOGY SOLUTIONS</span>

            <h2 className="section-title">
              Computers <span>& Accessories</span>
            </h2>

            <p className="section-subtitle">
              Discover enterprise-grade computing solutions designed for
              productivity, reliability, and performance. From powerful
              workstations to essential accessories, we provide technology that
              helps businesses grow.
            </p>
          </motion.div>

          <motion.div
            className="products-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {products.map((product, index) => {
              const Icon = product.icon;

              return (
                <motion.div
                  key={product.name}
                  variants={cardVariants}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: -10,
                          scale: 1.02,
                        }
                  }
                  className="product-card"
                >
                  <div className="card-glow"></div>

                  <motion.div
                    className="icon-box"
                    whileHover={
                      shouldReduceMotion
                        ? {}
                        : {
                            rotate: 5,
                            scale: 1.1,
                          }
                    }
                  >
                    <Icon size={32} />
                  </motion.div>

                  <h3>{product.name}</h3>

                  <p>{product.description}</p>

                  <a href="/" className="learn-more">
                    Learn More
                    <FaArrowRight />
                  </a>

                  <div className="card-number">
                    {(index + 1).toString().padStart(2, "0")}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <style>{`
        .product-section {
          position: relative;
          overflow: hidden;
          padding: 100px 20px;
          background: linear-gradient(
            180deg,
            #f8fffb 0%,
            #ffffff 50%,
            #f2fff8 100%
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

        .section-tag {
          display: inline-block;
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(0, 170, 92, 0.12);
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

        .section-subtitle {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #64748b;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .product-card {
          position: relative;
          padding: 35px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow:
            0 10px 30px rgba(0, 0, 0, 0.06),
            0 10px 40px rgba(0, 155, 85, 0.08);
          transition: all 0.3s ease;
          overflow: hidden;
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
          transition: opacity 0.3s ease;
        }

        .product-card:hover .card-glow {
          opacity: 1;
        }

        .icon-box {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #009b55, #19c37d);
          color: #fff;
          margin-bottom: 25px;
          box-shadow: 0 15px 30px rgba(0, 155, 85, 0.3);
        }

        .product-card h3 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 15px;
        }

        .product-card p {
          color: #64748b;
          line-height: 1.8;
          margin-bottom: 25px;
        }

        .learn-more {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #009b55;
          font-weight: 700;
          text-decoration: none;
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

        .bg-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.25;
        }

        .bg-circle-1 {
          width: 350px;
          height: 350px;
          background: #19c37d;
          top: -120px;
          left: -120px;
        }

        .bg-circle-2 {
          width: 450px;
          height: 450px;
          background: #009b55;
          bottom: -180px;
          right: -180px;
        }

        @media (max-width: 768px) {
          .product-section {
            padding: 70px 15px;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }

          .product-card {
            padding: 25px;
          }

          .section-subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default ProductListComponent;