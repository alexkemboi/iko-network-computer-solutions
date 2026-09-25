import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  FaMoneyBillWave,
  FaUniversity,
  FaBookOpen,
  FaClock,
  FaCashRegister,
  FaBitcoin,
  FaHandHoldingUsd,
  FaBuilding,
  FaCheckCircle,
  FaShieldAlt,
  FaCubes,
  FaThLarge,
  FaGraduationCap,
  FaCreditCard,
  FaBriefcase,
  FaWifi,
  FaReceipt,
  FaChartBar,
  FaUserGraduate,
  FaCalendarAlt,
  FaKey,
  FaTools,
  FaBarcode,
  FaStore,
  FaWallet,
  FaExchangeAlt,
  FaPercent,
  FaFileInvoiceDollar,
  FaMobileAlt,
  FaClipboardList,
} from "react-icons/fa";
import SectionHeader, { useRevealVariants } from "../shared/SectionHeader";
import FilterTabs from "../shared/FilterTabs";
import Carousel from "../shared/Carousel";
import CardVisual from "../shared/CardVisual";
import { CardActions, SectionCta } from "../shared/CardActions";

export const products = [
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

/* Presentation-only grouping and illustration for the catalogue */
const CATEGORIES = [
  { value: "all", label: "All products", icon: FaThLarge },
  { value: "education", label: "Education", icon: FaGraduationCap },
  { value: "payments", label: "Payments & Finance", icon: FaCreditCard },
  { value: "operations", label: "Business Operations", icon: FaBriefcase },
];

const PRODUCT_META = {
  "Internet Billing System": { category: "payments", chips: [FaWifi, FaReceipt, FaChartBar] },
  "School Fees Management": { category: "education", chips: [FaMobileAlt, FaReceipt, FaChartBar] },
  "School Academics System": { category: "education", chips: [FaUserGraduate, FaClipboardList, FaCalendarAlt] },
  "Property Management System": { category: "operations", chips: [FaKey, FaFileInvoiceDollar, FaTools] },
  "Time Tabling Software": { category: "education", chips: [FaCalendarAlt, FaUserGraduate, FaClipboardList] },
  "Point Of Sale System": { category: "operations", chips: [FaBarcode, FaStore, FaChartBar] },
  "Visa POS To Crypto System": { category: "payments", chips: [FaWallet, FaExchangeAlt, FaShieldAlt] },
  "Shylock Lending System": { category: "payments", chips: [FaPercent, FaCalendarAlt, FaChartBar] },
};

const categoryLabel = (value) => CATEGORIES.find((c) => c.value === value)?.label;

const ProductListComponent = () => {
  const { cardVariants } = useRevealVariants(0.07);
  const [filter, setFilter] = useState("all");

  const visible = useMemo(
    () =>
      products.filter(
        (p) => filter === "all" || PRODUCT_META[p.title]?.category === filter
      ),
    [filter]
  );

  const options = CATEGORIES.map((c) => ({
    ...c,
    count:
      c.value === "all"
        ? products.length
        : products.filter((p) => PRODUCT_META[p.title]?.category === c.value).length,
  }));

  return (
    <section className="ix-section ix-section--alt products-section" id="products">
      <div className="ix-glow ix-glow--tl"></div>

      <div className="ix-container">
        <SectionHeader
          eyebrow="IKONEX SOFTWARE PRODUCTS"
          icon={FaCubes}
          title={
            <>
              Enterprise Software
              <span> Solutions</span>
            </>
          }
        >
          Modern enterprise-grade systems designed to automate business
          operations, improve efficiency and accelerate digital transformation
          using secure and scalable technologies.
        </SectionHeader>

        <div className="ix-toolbar ix-toolbar--center">
          <FilterTabs
            label="Filter products by category"
            options={options}
            value={filter}
            onChange={setFilter}
          />
        </div>

        <Carousel label="Software products" className="ix-carousel--four" resetKey={filter}>
          {visible.map((product) => {
            const meta = PRODUCT_META[product.title] || {};
            const item = {
              price: product.price,
              name: product.title,
              icon: product.icon,
              section: "Software Products",
              category: categoryLabel(meta.category),
              features: product.features,
            };

            return (
              <motion.article
                key={product.title}
                className="ix-card product-card"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
              >
                <CardVisual
                  icon={product.icon}
                  chips={meta.chips}
                  pattern="dots"
                  badge="ENTERPRISE READY"
                  badgeIcon={FaShieldAlt}
                />

                <span className="ix-card__eyebrow">{categoryLabel(meta.category)}</span>

                <h3 className="ix-card__title">{product.title}</h3>

                <ul className="ix-list">
                  {product.features.slice(0, 3).map((feature) => (
                    <li key={feature}>
                      <FaCheckCircle aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                  {product.features.length > 3 && (
                    <li className="product-card__more">
                      +{product.features.length - 3} more capabilities
                    </li>
                  )}
                </ul>

                <div className="ix-card__footer">
                  <CardActions item={item} primaryLabel="Explore Product" orderLabel="Order" />
                </div>
              </motion.article>
            );
          })}
        </Carousel>

        <SectionCta text="Need a system built around your workflow?" />
      </div>

      <style>{`
        .product-card {
          padding: 24px;
        }

        .product-card .ix-media {
          margin: -24px -24px 20px;
        }

        .product-card .ix-card__title {
          font-size: 1.15rem;
          min-height: 2.6em;
        }

        .product-card .ix-list li {
          font-size: .9rem;
        }

        .product-card__more {
          padding-left: 26px;
          color: var(--text-subtle) !important;
          font-size: .82rem !important;
          font-weight: 600;
        }

      `}</style>
    </section>
  );
};

export default ProductListComponent;
