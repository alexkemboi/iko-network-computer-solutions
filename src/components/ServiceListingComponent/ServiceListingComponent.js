import React from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaCode, FaFileAlt, FaPaintBrush, FaGlobe, FaPrint, FaBullhorn, FaShieldAlt, FaWifi } from "react-icons/fa";
import { useOrder } from "../../commerce/OrderContext";
import SectionHeader, { useRevealVariants } from "../shared/SectionHeader";
import { developmentServices } from "../SoftwareComponent/SoftwareComponent";
import { cyberServices } from "../Cyber/Cyber";
import { onlineServices } from "../OnlineServices/OnlineServices";

export const creativeServices = [
  { title: "Graphics Design", icon: FaPaintBrush, description: "Professional logo creation, social media graphics, UI/UX mockups, marketing materials and modern visual identity systems tailored for businesses.", items: ["Logo & Brand Identity", "Social Media Graphics", "UI/UX Mockups", "Marketing Materials"] },
  { title: "Printing Services", icon: FaPrint, description: "High-quality printing solutions for business cards, banners, posters, brochures and branded merchandise with premium finishing.", items: ["Business Cards", "Banners & Posters", "Flyers & Brochures", "Large Format Printing"] },
  { title: "Digital Branding", icon: FaBullhorn, description: "Modern branding and digital marketing solutions designed to increase visibility, strengthen brand presence and grow businesses.", items: ["Brand Strategy", "Digital Campaigns", "Content Creation", "Business Rebranding"] },
];

const groups = [
  { title: "Software & Web Development", icon: FaCode, summary: "Custom digital platforms that streamline operations and support growth.", items: developmentServices.map((s) => ({ name: s.name, description: s.description, icon: s.icon, features: s.features })) },
  { title: "Digital Support & Online Services", icon: FaGlobe, summary: "Practical document, cyber and assisted online services for people and organizations.", items: [...cyberServices.map((s) => ({ name: s.name, description: s.description, icon: s.icon })), ...onlineServices.map((s) => ({ name: s.name, description: s.description, icon: s.icon }))] },
  { title: "Creative & Digital Services", icon: FaPaintBrush, summary: "Brand identity, graphic design, printing and digital campaigns, brought together in one creative offering.", items: creativeServices.map((s) => ({ name: s.title, description: s.description, icon: s.icon, features: s.items })) },
];

const digitalServiceGroups = [
  { id: "cyber", title: "Cyber Services", icon: FaShieldAlt, summary: "Reliable cyber and digital support services for individuals and businesses, including system support, document services, internet services, and other everyday technology needs.", items: cyberServices.map((service) => ({ name: service.name, description: service.description, icon: service.icon })) },
  { id: "online-services", title: "Online Services", icon: FaWifi, summary: "Convenient access to essential online services, applications, digital assistance, document processing, and other internet-based services.", items: onlineServices.map((service) => ({ name: service.name, description: service.description, icon: service.icon })) },
  { id: "graphics-design", title: "Graphics & Design", icon: FaPaintBrush, summary: "Professional graphic design for business and personal needs, including posters, flyers, social media creatives, marketing materials, and digital artwork.", items: [{ name: creativeServices[0].title, description: creativeServices[0].description, icon: creativeServices[0].icon, features: creativeServices[0].items }] },
  { id: "branding-printing", title: "Branding & Printing", icon: FaPrint, summary: "Complete branding solutions including business cards, banners, brochures, stationery, promotional materials, and quality printing services.", items: creativeServices.slice(1).map((service) => ({ name: service.title, description: service.description, icon: service.icon, features: service.items })) },
];

const ServiceListComponent = ({ dedicated = false }) => {
  const { containerVariants, cardVariants } = useRevealVariants(0.1);
  const { openDetails, openCheckout } = useOrder();
  const activeGroups = dedicated ? digitalServiceGroups : groups;
  return (
    <section className={`ix-section services-consolidated ${dedicated ? "services-consolidated--page" : ""}`} id={dedicated ? "digital-services" : "services"}>
      {!dedicated && <>
        <span id="software" className="ix-anchor" aria-hidden="true" />
        <span id="branding" className="ix-anchor" aria-hidden="true" />
        <span id="cyber" className="ix-anchor" aria-hidden="true" />
        <span id="online-services" className="ix-anchor" aria-hidden="true" />
      </>}
      <div className="ix-container">
        {dedicated ? <header className="services-page-hero">
          <span className="ix-eyebrow"><FaFileAlt aria-hidden="true" /> CYBER & DIGITAL SERVICES</span>
          <h1>Everything Your Business Needs, Under One Roof</h1>
          <p>At <strong>IKONEX SYSTEMS</strong>, we provide practical digital and creative services that help individuals, businesses, and organizations operate, communicate, and grow more effectively.</p>
        </header> : <SectionHeader eyebrow="OUR SERVICES" icon={FaFileAlt} title="Services that move ideas forward">
          From software development and digital support to creative and digital services, IKONEX brings practical expertise together to help clients get things done.
        </SectionHeader>}
        <motion.div className="services-consolidated__grid" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
          {activeGroups.map((group) => {
            const GroupIcon = group.icon;
            return <motion.article id={group.id} className="ix-card services-group" key={group.title} variants={cardVariants}>
              <div className="services-group__intro"><span className="ix-icon ix-icon--soft"><GroupIcon /></span><h3 className="ix-card__title">{group.title}</h3><p className="ix-card__text">{group.summary}</p></div>
              <ul className="services-group__list">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const detail = { ...item, section: group.title, featuresLabel: "What's included" };
                  return <li key={item.name} className="services-group__item">
                    <span className="services-group__item-icon"><Icon /></span>
                    <span className="services-group__item-copy"><strong>{item.name}</strong><span>{item.description}</span></span>
                    <button type="button" className="services-group__item-action" aria-label={`View ${item.name}`} onClick={() => openDetails(detail)}><FaArrowRight /></button>
                  </li>;
                })}
              </ul>
              <button type="button" className="ix-btn ix-btn--outline services-group__cta" onClick={() => openCheckout({ name: group.title, section: "Services", description: group.summary, orderLabel: "Get Started" })}>Get started <FaArrowRight /></button>
            </motion.article>;
          })}
        </motion.div>
        {dedicated && <div className="services-page-close"><strong>One Partner. Multiple Digital Solutions.</strong><a className="ix-btn ix-btn--primary" href="#contact">Talk to our team <FaArrowRight aria-hidden="true" /></a></div>}
      </div>
      <style>{`
        .services-consolidated { background:var(--bg); }
        .services-page-hero { max-width:900px;margin:0 auto clamp(42px,6vw,68px);text-align:center; }
        .services-page-hero .ix-eyebrow { display:inline-flex;align-items:center;gap:8px; }
        .services-page-hero h1 { margin:0 auto 16px;color:var(--heading);font-size:clamp(2.2rem,5vw,3.8rem);font-weight:700;line-height:1.08;letter-spacing:-.035em; }
        .services-page-hero p { max-width:750px;margin:0 auto;color:var(--text-muted);font-size:clamp(1rem,1.5vw,1.15rem);line-height:1.75; }
        .services-page-hero strong { color:var(--heading);font-weight:700; }
        .services-consolidated--page .services-consolidated__grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
        .services-consolidated--page .services-group { scroll-margin-top:120px; }
        .services-page-close { display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:18px;margin-top:42px;padding:26px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface); }
        .services-page-close strong { color:var(--heading);font-size:clamp(1.2rem,2vw,1.6rem);font-weight:700; }
        .services-consolidated__grid { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px; }
        .services-group { display:flex;flex-direction:column;padding:24px; }
        .services-group__intro .ix-icon { margin:0 0 18px;width:48px;height:48px;border-radius:14px; }
        .services-group .ix-card__title { font-size:clamp(1.15rem,1.6vw,1.35rem);font-weight:700;margin-bottom:8px; }
        .services-group__list { list-style:none;padding:0;margin:8px 0 20px; }
        .services-group__item { display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-top:1px solid var(--border); }
        .services-group__item-icon { display:grid;place-items:center;flex:none;width:30px;height:30px;border-radius:9px;background:var(--surface-strong);color:var(--brand-text);font-size:.8rem; }
        .services-group__item-copy { min-width:0;display:grid;gap:3px;flex:1; }
        .services-group__item-copy strong { color:var(--heading);font-size:.88rem;font-weight:700; }
        .services-group__item-copy span { color:var(--text-muted);font-size:.78rem;line-height:1.45; }
        .services-group__item-action { flex:none;border:0;background:transparent;color:var(--brand-text);padding:6px;cursor:pointer; }
        .services-group__cta { margin-top:auto;justify-content:center;font-weight:700; }
        @media(max-width:950px) { .services-consolidated__grid{grid-template-columns:1fr 1fr;} .services-group:last-child{grid-column:1/-1;} }
        @media(max-width:640px) { .services-consolidated__grid{grid-template-columns:1fr;} .services-group:last-child{grid-column:auto;} }
        @media(max-width:760px) { .services-consolidated--page .services-consolidated__grid{grid-template-columns:1fr;} }
      `}</style>
    </section>
  );
};

export default ServiceListComponent;
