import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FaGlobeAfrica,
  FaThLarge,
  FaLandmark,
  FaCoins,
  FaBus,
  FaAt,
  FaSearch,
  FaArrowRight,
  FaBolt,
} from "react-icons/fa";
import SectionHeader, { EASE } from "../shared/SectionHeader";
import FilterTabs from "../shared/FilterTabs";
import { SectionCta } from "../shared/CardActions";
import { useOrder } from "../../commerce/OrderContext";

export const onlineServices = [
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

/* Presentation-only grouping for quick discovery */
const CATEGORIES = [
  { value: "all", label: "All", icon: FaThLarge },
  { value: "government", label: "Government", icon: FaLandmark },
  { value: "finance", label: "Tax & Finance", icon: FaCoins },
  { value: "education", label: "Education", icon: FaGraduationCap },
  { value: "transport", label: "Transport", icon: FaBus },
  { value: "communication", label: "Email", icon: FaAt },
];

const SERVICE_CATEGORY = {
  "Email Services": "communication",
  "KRA Services": "finance",
  "eCitizen Services": "government",
  "KUCCPS Services": "education",
  "NTSA Services": "transport",
  "TIMS Services": "transport",
  "GHRIS Services": "government",
  "Payslip Services": "government",
  "CRB Services": "finance",
  "HELB Services": "education",
};

const labelFor = (value) => CATEGORIES.find((c) => c.value === value)?.label;

const OnlineServices = () => {
  const { openCheckout, openDetails } = useOrder();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return onlineServices.filter((s) => {
      const inCat = filter === "all" || SERVICE_CATEGORY[s.name] === filter;
      const inQuery =
        !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [filter, query]);

  const options = CATEGORIES.map((c) => ({
    ...c,
    count:
      c.value === "all"
        ? undefined
        : onlineServices.filter((s) => SERVICE_CATEGORY[s.name] === c.value).length,
  }));

  return (
    <section className="ix-section online-services-section" id="online-services">
      <div className="ix-glow ix-glow--br"></div>

      <div className="ix-container">
        <SectionHeader
          eyebrow="DIGITAL & GOVERNMENT SERVICES"
          icon={FaGlobeAfrica}
          title={<span>Online Services</span>}
        >
          Convenient access to essential online, government, educational,
          transport, tax, and financial services delivered efficiently by our
          experienced support team.
        </SectionHeader>

        <div className="ix-toolbar online-toolbar">
          <FilterTabs
            label="Filter online services"
            options={options}
            value={filter}
            onChange={setFilter}
          />

          <label className="ix-search">
            <span className="ix-sr-only">Search online services</span>
            <FaSearch aria-hidden="true" />
            <input
              type="search"
              placeholder="Search e.g. KRA, HELB, passport…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        <p className="ix-sr-only" aria-live="polite">
          {visible.length} service{visible.length === 1 ? "" : "s"} shown
        </p>

        <motion.div className="online-grid" layout>
          <AnimatePresence initial={false}>
            {visible.map((service, index) => {
              const Icon = service.icon;
              const item = {
                price: service.price,
                name: service.name,
                icon: service.icon,
                section: "Online Services",
                category: labelFor(SERVICE_CATEGORY[service.name]),
                description: service.description,
                orderLabel: "Get Started",
              };

              return (
                <motion.article
                  key={service.name}
                  layout
                  className="ix-card online-card"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.04, ease: EASE }}
                >
                  <div className="online-card__top">
                    <span className="ix-icon ix-icon--soft online-card__icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="online-card__cat">
                      {labelFor(SERVICE_CATEGORY[service.name])}
                    </span>
                  </div>

                  <h3 className="ix-card__title">{service.name}</h3>

                  <p className="ix-card__text">{service.description}</p>

                  <div className="ix-card__footer online-card__actions">
                    <button
                      type="button"
                      className="ix-link online-card__link"
                      onClick={() => openDetails(item)}
                      aria-label={`Learn more about ${service.name}`}
                    >
                      Learn More
                      <FaArrowRight aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      className="ix-btn ix-btn--primary online-card__go"
                      onClick={() => openCheckout(item)}
                      aria-label={`Get started with ${service.name} and pay with M-Pesa`}
                    >
                      <FaBolt aria-hidden="true" />
                      Get Started
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>

          {visible.length === 0 && (
            <div className="ix-empty">
              No services match “{query}”.{" "}
              <button
                type="button"
                className="ix-link online-reset"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Show all services
              </button>
            </div>
          )}
        </motion.div>

        <SectionCta text="Don't see the service you need?" label="Ask our team" />
      </div>

      <style>{`
        .online-toolbar {
          align-items: center;
        }

        .online-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
          gap: clamp(14px, 1.8vw, 22px);
        }

        .online-card {
          padding: 22px;
        }

        .online-card__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 16px;
        }

        .online-card__icon {
          width: 46px;
          height: 46px;
          margin: 0;
          border-radius: 14px;
          font-size: 1.1rem;
        }

        .online-card__cat {
          font-size: .7rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--text-subtle);
        }

        .online-card .ix-card__title {
          font-size: 1.06rem;
          margin-bottom: 8px;
        }

        .online-card .ix-card__text {
          font-size: .9rem;
          line-height: 1.65;
          margin-bottom: 18px;
        }

        .online-card__actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .online-card__link,
        .online-reset {
          background: none;
          border: 0;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          font-size: .88rem;
        }

        .online-card__actions {
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .online-card__go {
          box-shadow: none;
          min-height: 38px;
          padding: 8px 14px;
          font-size: .84rem;
          border-radius: 11px;
        }
      `}</style>
    </section>
  );
};

export default OnlineServices;
