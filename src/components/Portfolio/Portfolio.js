import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaTrophy, FaCheck, FaExternalLinkAlt, FaGlobe, FaArrowRight } from "react-icons/fa";
import SectionHeader, { useRevealVariants } from "../shared/SectionHeader";
import { products, deploymentsOf } from "../ProductListingComponent/ProductListingComponent";

// Every live deployment is a portfolio project (a product serving several clients yields several).
const projects = products.flatMap((product) => deploymentsOf(product).filter((site) => site.image).map((site) => ({ ...product, ...site })));
const categories = ["All", ...new Set(projects.map((project) => project.category))];

const Portfolio = () => {
  const { cardVariants } = useRevealVariants(0.1);
  const [category, setCategory] = useState("All");
  const visible = useMemo(() => projects.filter((project) => category === "All" || project.category === category), [category]);

  return (
    <section className="ix-section ix-section--alt portfolio-section" id="portfolio">
      <div className="ix-container">
        <SectionHeader level={1} eyebrow="OUR WORK" icon={FaTrophy} title={<>Featured <span>Portfolio</span></>}>
          Live platforms we have designed, built and deployed for businesses, schools and communities. Every project below is in production today.
        </SectionHeader>

        <div className="products-filter portfolio-filter" role="group" aria-label="Filter projects by category">
          {categories.map((name) => <button key={name} type="button" className={category === name ? "is-active" : ""} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}
        </div>

        <div className="portfolio-list">
          {visible.map((project) => (
            <motion.article key={project.url} className="ix-card portfolio-project" variants={cardVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}>
              <a className="portfolio-project__media" href={project.url} target="_blank" rel="noreferrer" aria-label={`Open ${project.title} live website`}>
                <span className="portfolio-project__bar" aria-hidden="true">
                  <span /><span /><span />
                  <span className="portfolio-project__address"><FaGlobe /> {new URL(project.url).hostname}</span>
                </span>
                <img src={project.image} alt={`${project.title} website`} loading="lazy" />
              </a>
              <div className="portfolio-project__body">
                <span className="ix-card__eyebrow">{project.category}</span>
                <h2 className="portfolio-project__title">{project.title}</h2>
                <p className="portfolio-project__client">{project.client ? <>Client: <strong>{project.client}</strong></> : <>IKONEX in-house platform</>}</p>
                <p className="ix-card__text">{project.description}</p>
                <h3 className="portfolio-project__label">What we delivered</h3>
                <ul className="portfolio-project__features">
                  {project.features.map((feature) => <li key={feature}><FaCheck aria-hidden="true" />{feature}</li>)}
                </ul>
                <div className="portfolio-project__actions">
                  <a className="ix-btn ix-btn--primary" href={project.url} target="_blank" rel="noreferrer">Visit live site <FaExternalLinkAlt aria-hidden="true" /></a>
                  <a className="ix-btn ix-btn--outline" href="#contact">Start a similar project <FaArrowRight aria-hidden="true" /></a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
      <style>{`
        .portfolio-section { background:radial-gradient(900px 520px at 8% 0%,var(--brand-soft-2),transparent 62%),linear-gradient(180deg,var(--brand-soft),var(--bg-alt) 60%); }
        .products-filter { display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:-22px 0 32px; }
        .products-filter button { border:1px solid var(--border-strong);border-radius:999px;background:var(--surface-solid);color:var(--text-muted);padding:8px 14px;font:600 .82rem var(--font-sans);cursor:pointer;transition:all .2s ease; }
        .products-filter button:hover,.products-filter button.is-active { border-color:var(--brand-border);background:var(--brand-soft);color:var(--brand-text); }
        .portfolio-list { display:grid;gap:28px; }
        .portfolio-project { display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:0;padding:0;overflow:hidden; }
        .portfolio-project:nth-child(even) .portfolio-project__media { order:2; }
        .portfolio-project__media { display:flex;flex-direction:column;justify-content:center;padding:24px;background:linear-gradient(135deg,var(--brand-soft-2),var(--brand-soft));text-decoration:none; }
        .portfolio-project__bar { display:flex;align-items:center;gap:5px;height:28px;padding:0 10px;background:#fff;border-radius:10px 10px 0 0; }
        .portfolio-project__bar > span:nth-child(-n+3) { width:8px;height:8px;border-radius:50%;background:#ff5f57; }
        .portfolio-project__bar > span:nth-child(2) { background:#febc2e; }
        .portfolio-project__bar > span:nth-child(3) { background:#28c840; }
        .portfolio-project__address { margin-left:8px;flex:1;min-width:0;display:flex;align-items:center;gap:6px;height:18px;padding:0 8px;border-radius:5px;background:#f2f5f3;color:#66736c;font-size:11px;white-space:nowrap;overflow:hidden; }
        .portfolio-project__media img { display:block;width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top;box-shadow:0 18px 36px -20px rgba(2,6,23,.55);transition:transform .5s var(--ease); }
        .portfolio-project__media:hover img { transform:scale(1.02); }
        .portfolio-project__body { display:flex;flex-direction:column;padding:clamp(22px,3vw,36px); }
        .portfolio-project__title { margin:6px 0 4px;color:var(--heading);font-size:clamp(1.35rem,2.2vw,1.75rem);font-weight:700; }
        .portfolio-project__client { margin:0 0 12px;color:var(--text-muted);font-size:.88rem; }
        .portfolio-project__client strong { color:var(--brand-text); }
        .portfolio-project__label { margin:4px 0 10px;color:var(--heading);font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase; }
        .portfolio-project__features { display:grid;gap:8px;list-style:none;padding:0;margin:0 0 22px;font-size:.9rem;color:var(--text); }
        .portfolio-project__features li { display:flex;gap:9px;align-items:flex-start; }
        .portfolio-project__features svg { flex:none;margin-top:5px;font-size:.72rem;color:var(--brand-text); }
        .portfolio-project__actions { display:flex;flex-wrap:wrap;gap:10px;margin-top:auto; }
        .portfolio-project__actions .ix-btn { min-height:40px;font-size:.86rem;font-weight:700; }
        @media(max-width:860px) { .portfolio-project{grid-template-columns:1fr;} .portfolio-project:nth-child(even) .portfolio-project__media{order:0;} .portfolio-project__media{padding:16px;} }
      `}</style>
    </section>
  );
};

export default Portfolio;
