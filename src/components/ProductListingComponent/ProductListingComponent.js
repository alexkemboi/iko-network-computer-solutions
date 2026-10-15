import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaExternalLinkAlt, FaGlobe, FaCubes, FaShoppingCart } from "react-icons/fa";
import { useOrder } from "../../commerce/OrderContext";
import SectionHeader, { useRevealVariants } from "../shared/SectionHeader";
import ikonexShot from "../../images/products/ikonex.jpg";
import abraShot from "../../images/products/abra.jpg";
import dssShot from "../../images/products/dss.jpg";
import saipeiShot from "../../images/products/saipei.jpg";
import baronShot from "../../images/products/baron.jpg";
import electionsShot from "../../images/products/elections.jpg";
import chessShot from "../../images/products/chess254.jpg";
import beesmartShot from "../../images/products/beesmart.jpg";

// The catalogue remains the single source of truth for the live product showcase,
// the portfolio page and the clients strip. A product either has its own live site
// (`url`/`image`/`client`) or is one platform deployed for several clients (`deployments`).
export const products = [
  { title: "IKONEX Systems", image: ikonexShot, category: "Business & Technology", description: "A corporate home for IKONEX services, solutions and technology capabilities.", url: "https://ikonexsystems.com", features: ["Company and service discovery", "Direct client enquiries", "Responsive corporate experience"] },
  { title: "Property Management System", category: "Real Estate", description: "A property and real estate platform for listings, tenancy, rent collection and maintenance.", features: ["Property listings and discovery", "Tenant management", "Rent collection and billing", "Lease tracking", "Maintenance requests", "Financial reports"],
    deployments: [{ client: "Abra Home Realty", url: "https://www.abrahomereality.com", image: abraShot }] },
  { title: "Shylock Lending System", category: "Payments & Finance", description: "Loan management workflows for processing applications and tracking repayments.", features: ["Loan processing", "Repayment scheduling", "Customer loan tracking", "Interest calculation", "Financial insights"],
    deployments: [{ client: "DSS (Don't Stuck Solutions)", url: "https://dss.ikonexsystems.com", image: dssShot }] },
  { title: "Point Of Sale System", category: "Retail & Payments", description: "A configurable retail system for managing sales, inventory and business reporting.", features: ["Sales and inventory", "Barcode scanning", "Multi-branch support", "Customer purchase tracking", "Business reporting"],
    deployments: [{ client: "Saipei Foods Limited", url: "https://saipeipos.ikonexsystems.com", image: saipeiShot }] },
  { title: "Baron Auto Valuers", client: "Baron Auto Valuers", image: baronShot, category: "Automotive", description: "A focused digital presence for professional motor vehicle valuation services.", url: "https://baron.ikonexsystems.com", features: ["Valuation service information", "Client enquiries", "Professional online presence"] },
  { title: "Elections 2027", client: "Elections 2027 Campaign", image: electionsShot, category: "Civic Technology", description: "A digital platform for sharing election-related information and supporting organized participation.", url: "https://elections2027.ikonexsystems.com", features: ["Election information", "Digital engagement", "Responsive access"] },
  { title: "Chess254", client: "Chess254 Clubhouse", image: chessShot, category: "Gaming & Community", description: "An online chess platform for players to play, learn and connect with the chess community.", url: "https://chess254.ikonexsystems.com", features: ["Play chess online", "Learning and practice", "Chess community access"] },
  { title: "Internet Billing System", category: "Payments & Finance", description: "A configurable billing platform for internet service providers and subscription businesses.", features: ["Automated customer billing", "Bandwidth monitoring", "Online payments", "Subscription management", "Invoices and receipts"],
    deployments: [{ client: "BeeSmart / BEDAK", url: "https://beesmartbedak.com", image: beesmartShot }] },
  { title: "School Management System", category: "Education", description: "One school platform covering academics, fee collection and timetabling.", features: ["Student academic records", "Exam and grading management", "Attendance tracking", "Fee tracking with M-Pesa and bank integration", "Automated receipts and balances", "Timetable generation with conflict detection", "Teacher allocation", "Parent and teacher portal", "Financial reports"] },
  { title: "Visa POS To Crypto System", category: "Payments & Finance", description: "A payment concept connecting point-of-sale transactions with digital asset workflows.", features: ["Crypto wallet integration", "Visa POS processing", "Secure transactions", "Currency conversion", "Payment analytics"] },
];

/** Every live site of a product, whichever shape the catalogue entry uses. */
export const deploymentsOf = (product) => product.deployments
  || (product.url ? [{ client: product.client, url: product.url, image: product.image }] : []);

// Bundled screenshots (captured with headless Chrome) instead of iframes: several product
// sites send X-Frame-Options / frame-ancestors and refuse to be embedded.
function SitePreview({ title, site }) {
  const [failed, setFailed] = useState(false);
  const hostname = new URL(site.url).hostname;
  return (
    <a className="product-preview" href={site.url} target="_blank" rel="noreferrer" aria-label={`Open ${title} live website`}>
      <span className="product-preview__bar" aria-hidden="true">
        <span className="product-preview__dot" /><span className="product-preview__dot" /><span className="product-preview__dot" />
        <span className="product-preview__address"><FaGlobe /> {hostname}</span>
      </span>
      <span className="product-preview__viewport">
        {failed || !site.image
          ? <span className="product-preview__fallback"><FaGlobe aria-hidden="true" />{hostname}</span>
          : <img src={site.image} alt={`${title} website preview`} loading="lazy" onError={() => setFailed(true)} />}
        <span className="product-preview__open" aria-hidden="true"><FaExternalLinkAlt /></span>
      </span>
    </a>
  );
}

function ProductCard({ product, variants }) {
  const { openDetails, openCheckout } = useOrder();
  const sites = deploymentsOf(product);
  const [active, setActive] = useState(0);
  const site = sites[active];
  const order = { name: product.title, section: "Our Products", category: product.category, description: product.description, features: product.features };
  return (
    <motion.article className="ix-card product-showcase-card" variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }}>
      {site
        ? <SitePreview key={site.url} title={site.client || product.title} site={site} />
        : <div className="product-showcase-card__planned"><FaCubes aria-hidden="true" /><span>Configurable system</span></div>}
      <div className="product-showcase-card__body">
        <span className="ix-card__eyebrow">{product.category}</span>
        <h3 className="ix-card__title">{product.title}</h3>
        {product.deployments && <div className="product-clients" role="group" aria-label={`${product.title} clients`}>
          <span className="product-clients__label">Live for</span>
          {sites.map((deployment, index) => <button key={deployment.url} type="button" className={index === active ? "is-active" : ""} aria-pressed={index === active} onClick={() => setActive(index)}>{deployment.client}</button>)}
        </div>}
        <p className="ix-card__text">{product.description}</p>
        <div className="product-showcase-card__actions">
          <button type="button" className="ix-btn ix-btn--outline" onClick={() => openDetails(order)}>Details <FaArrowRight aria-hidden="true" /></button>
          {site
            ? <a className="ix-btn ix-btn--primary" href={site.url} target="_blank" rel="noreferrer">Visit <FaExternalLinkAlt aria-hidden="true" /></a>
            : <button type="button" className="ix-btn ix-btn--primary" onClick={() => openCheckout(order)}><FaShoppingCart aria-hidden="true" /> Order</button>}
        </div>
      </div>
    </motion.article>
  );
}

const filterOptions = [
  { value: "all", label: "All products" },
  { value: "live", label: "Live websites" },
  { value: "education", label: "Education" },
  { value: "payments", label: "Payments & Finance" },
  { value: "operations", label: "Business & Community" },
];

const ProductListComponent = () => {
  const { cardVariants } = useRevealVariants(0.08);
  const [filter, setFilter] = useState("all");
  const visibleProducts = useMemo(() => products.filter((product) => {
    if (filter === "all") return true;
    if (filter === "live") return deploymentsOf(product).length > 0;
    const category = product.category === "Education" ? "education"
      : ["Payments & Finance", "Retail & Payments"].includes(product.category) ? "payments" : "operations";
    return filter === category;
  }), [filter]);
  return (
    <section className="ix-section ix-section--alt products-section" id="products">
      <div className="ix-container">
        <SectionHeader eyebrow="BUILT AND DEPLOYED BY IKONEX" icon={FaCubes} title="Our Products">
          Real digital products designed for the needs of businesses, schools and communities. Explore the interface, capabilities and live experience of each platform.
        </SectionHeader>
        <div className="products-filter" role="group" aria-label="Filter products by category">
          {filterOptions.map((option) => <button key={option.value} type="button" className={filter === option.value ? "is-active" : ""} aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}>{option.label}</button>)}
        </div>
        <div className="products-showcase">
          {visibleProducts.map((product) => <ProductCard key={product.title} product={product} variants={cardVariants} />)}
        </div>
      </div>
      <style>{`
        .products-showcase { display:grid; grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); gap:16px; }
        .product-showcase-card { overflow:hidden; padding:0; display:flex; flex-direction:column; }
        .product-showcase-card { transition:transform .25s var(--ease),box-shadow .25s var(--ease),border-color .25s var(--ease); }
        .product-showcase-card:hover { transform:translateY(-4px);border-color:var(--border-strong);box-shadow:var(--shadow-md); }
        .product-preview { display:block; padding:12px 12px 0; background:var(--bg-alt); border-bottom:1px solid var(--border); text-decoration:none; }
        .product-showcase-card__planned { aspect-ratio:16/11;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:var(--bg-alt);border-bottom:1px solid var(--border);color:var(--text-muted);font-weight:600;font-size:.82rem; }
        .product-showcase-card__planned svg { font-size:1.3rem;color:var(--brand-text); }
        .product-preview__bar { height:22px; display:flex; align-items:center; gap:4px; padding:0 8px; background:#fff; border:1px solid #e2e8f0; border-bottom:0; border-radius:9px 9px 0 0; }
        .product-preview__dot { width:6px;height:6px;border-radius:50%;background:#ff5f57; }
        .product-preview__dot:nth-child(2) { background:#febc2e; }
        .product-preview__dot:nth-child(3) { background:#28c840; }
        .product-preview__address { margin-left:6px; height:14px; flex:1; min-width:0; display:flex; align-items:center; gap:4px; padding:0 6px; border-radius:4px; background:#f1f4f6; color:#64748b; font-size:9px; white-space:nowrap; overflow:hidden; }
        .product-preview__viewport { position:relative; display:block; aspect-ratio:16/10; overflow:hidden; background:#fff; border:1px solid #e2e8f0; border-bottom:0; }
        .product-preview__viewport img { display:block;width:100%;height:100%;object-fit:cover;object-position:top center;transition:transform .5s var(--ease); }
        .product-preview:hover .product-preview__viewport img { transform:scale(1.05); }
        .product-preview__fallback { height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#64748b;font-size:.78rem; }
        .product-preview__open { position:absolute; right:8px;top:8px;display:grid;place-items:center;width:26px;height:26px;border-radius:6px;background:var(--brand);color:#fff;font-size:.7rem;opacity:0;transform:translateY(-4px);transition:opacity .2s ease,transform .2s ease;box-shadow:0 2px 8px #14231d33; }
        .product-preview:hover .product-preview__open,.product-preview:focus-visible .product-preview__open { opacity:1;transform:none; }
        .product-showcase-card__body { display:flex;flex:1;flex-direction:column;padding:14px 16px 16px; }
        .product-showcase-card .ix-card__eyebrow { font-size:.68rem; }
        .product-showcase-card .ix-card__title { font-size:1.05rem;font-weight:700;margin:4px 0 6px; }
        .product-showcase-card .ix-card__text { font-size:.84rem;line-height:1.5;margin:0 0 12px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden; }
        .product-clients { display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 10px; }
        .product-clients__label { color:var(--text-muted);font-size:.7rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase; }
        .product-clients button { border:1px solid var(--border);border-radius:999px;background:var(--surface-solid);color:var(--text);padding:3px 10px;font:600 .74rem var(--font-sans);cursor:pointer;transition:all .2s ease; }
        .product-clients button:hover { border-color:var(--border-strong);color:var(--heading); }
        .product-clients button.is-active { background:var(--brand-soft);border-color:var(--brand-border);color:var(--brand-text); }
        .product-showcase-card__actions { display:flex;gap:8px;margin-top:auto; }
        .product-showcase-card__actions .ix-btn { flex:1;justify-content:center;min-height:34px;padding:6px 10px;font-size:.8rem;font-weight:700; }
        @media(max-width:520px) { .products-showcase{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;} }
      `}</style>
    </section>
  );
};
export default ProductListComponent;
