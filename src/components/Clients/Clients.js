import React from "react";
import { motion } from "framer-motion";
import { FaHandshake, FaExternalLinkAlt } from "react-icons/fa";
import SectionHeader, { useRevealVariants } from "../shared/SectionHeader";
import { products, deploymentsOf } from "../ProductListingComponent/ProductListingComponent";
import mpesaLogo from "../../images/tech/mpesa.svg";
import africasTalkingLogo from "../../images/tech/africastalking.png";
import postgresqlLogo from "../../images/tech/postgresql.svg";
import sqlServerLogo from "../../images/tech/microsoftsqlserver.svg";
import reactLogo from "../../images/tech/react.svg";
import nextLogo from "../../images/tech/nextjs.svg";
import javaLogo from "../../images/tech/java.svg";
import nodeLogo from "../../images/tech/nodejs.svg";
import nginxLogo from "../../images/tech/nginx.svg";
import pm2Logo from "../../images/tech/pm2.svg";

const clients = products.flatMap((product) => deploymentsOf(product).filter((site) => site.client).map((site) => ({ ...site, category: product.category })));

// Platforms our products are built on or integrate with. Shown as technologies, not as formal partnerships.
const technologies = [
  { name: "Safaricom M-Pesa", detail: "Daraja payments API", logo: mpesaLogo },
  { name: "Africa's Talking", detail: "SMS notifications", logo: africasTalkingLogo },
  { name: "PostgreSQL", detail: "Database", logo: postgresqlLogo },
  { name: "Microsoft SQL Server", detail: "Database", logo: sqlServerLogo },
  { name: "React", detail: "Web interfaces", logo: reactLogo },
  { name: "Next.js", detail: "Full-stack web apps", logo: nextLogo },
  { name: "Node.js", detail: "APIs & services", logo: nodeLogo },
  { name: "Java", detail: "Enterprise systems", logo: javaLogo },
  { name: "Nginx", detail: "Web hosting", logo: nginxLogo },
  { name: "PM2", detail: "Process management", logo: pm2Logo },
];

const initials = (name) => name.replace(/\(.*\)/, "").replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

const Clients = () => {
  const { containerVariants, cardVariants } = useRevealVariants(0.06);
  return (
    <section className="ix-section clients-section" id="clients">
      <div className="ix-container">
        <SectionHeader eyebrow="PARTNERS & CLIENTS" icon={FaHandshake} title="Trusted by growing organizations">
          Businesses, schools and communities across Kenya run on platforms designed, built and deployed by IKONEX.
        </SectionHeader>

        <motion.ul className="clients-grid" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
          {clients.map((client) => (
            <motion.li key={client.client} variants={cardVariants}>
              <a className="ix-card client-tile" href={client.url} target="_blank" rel="noreferrer">
                <span className="client-tile__mark" aria-hidden="true">{initials(client.client)}</span>
                <span className="client-tile__copy">
                  <strong>{client.client}</strong>
                  <span>{client.category}</span>
                </span>
                <FaExternalLinkAlt className="client-tile__open" aria-hidden="true" />
              </a>
            </motion.li>
          ))}
        </motion.ul>

        <div className="clients-tech">
          <h3 className="clients-tech__title">Technologies & integrations</h3>
          <ul className="clients-tech__list">
            {technologies.map(({ name, detail, logo }) => (
              <li key={name} className="clients-tech__item">
                <span className="clients-tech__logo"><img src={logo} alt="" loading="lazy" /></span>
                <span><strong>{name}</strong><span>{detail}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <style>{`
        .clients-section { background:var(--bg); }
        .clients-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;list-style:none;padding:0;margin:0; }
        .client-tile { position:relative;display:flex;flex-direction:row;align-items:center;text-align:left;gap:12px;padding:14px 16px;text-decoration:none;height:100%;transition:transform .25s var(--ease),border-color .25s var(--ease); }
        .client-tile:hover { transform:translateY(-3px);border-color:var(--border-strong); }
        .client-tile__mark { flex:none;display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:var(--brand-soft);border:1px solid var(--brand-border);color:var(--brand-text);font-weight:800;font-size:.9rem;letter-spacing:.02em; }
        .client-tile__copy { display:flex;flex-direction:column;min-width:0; }
        .client-tile__copy strong { color:var(--heading);font-size:.95rem;line-height:1.25; }
        .client-tile__copy span { color:var(--text-muted);font-size:.78rem; }
        .client-tile__open { position:absolute;top:10px;right:10px;font-size:.62rem;color:var(--text-subtle);opacity:0;transition:opacity .2s ease; }
        .client-tile:hover .client-tile__open { opacity:1; }
        .clients-tech { margin-top:44px;text-align:center; }
        .clients-tech__title { margin:0 0 16px;color:var(--text-muted);font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase; }
        .clients-tech__list { display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;list-style:none;padding:0;margin:0; }
        .clients-tech__item { display:flex;align-items:center;gap:12px;padding:10px 14px 10px 10px;border:1px solid var(--border);border-radius:16px;background:var(--surface);text-align:left;transition:border-color .25s var(--ease),transform .25s var(--ease); }
        .clients-tech__item:hover { border-color:var(--brand-border);transform:translateY(-2px); }
        /* White plate keeps every brand logo legible in dark mode too. */
        .clients-tech__logo { flex:none;display:grid;place-items:center;width:52px;height:52px;padding:8px;border-radius:12px;background:#fff;box-shadow:0 0 0 1px rgba(15,23,42,.06); }
        .clients-tech__logo img { display:block;max-width:100%;max-height:100%;object-fit:contain; }
        .clients-tech__item strong { display:block;color:var(--heading);font-size:.88rem;line-height:1.25; }
        .clients-tech__item span span { color:var(--text-muted);font-size:.74rem; }
      `}</style>
    </section>
  );
};

export default Clients;
