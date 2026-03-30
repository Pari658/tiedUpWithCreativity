import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/HomePage.css';

// ── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Bracelet: () => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="9" stroke="white" strokeWidth="2.5" fill="none" />
      <circle cx="16" cy="7" r="2" fill="white" />
      <circle cx="23.2" cy="20.6" r="1.5" fill="white" />
      <circle cx="8.8" cy="20.6" r="1.5" fill="white" />
    </svg>
  ),
  BraceletColored: (color = '#f4a89a') => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="3" fill="none" />
      <circle cx="24" cy="10" r="3" fill={color} />
      <circle cx="34.9" cy="31" r="2.5" fill={color} />
      <circle cx="13.1" cy="31" r="2.5" fill={color} />
      <circle cx="24" cy="38" r="2" fill={color} opacity="0.5"/>
    </svg>
  ),
  Anklet: (color = '#a8dbd6') => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="28" rx="14" ry="10" stroke={color} strokeWidth="3" fill="none"/>
      <circle cx="24" cy="18" r="3" fill={color}/>
      <circle cx="37" cy="31" r="2" fill={color}/>
      <circle cx="11" cy="31" r="2" fill={color}/>
      <line x1="24" y1="38" x2="24" y2="44" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="20" y1="44" x2="28" y2="44" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  GiftBox: (color = '#c9a227') => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="20" width="32" height="22" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
      <rect x="6" y="14" width="36" height="8" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
      <line x1="24" y1="14" x2="24" y2="42" stroke={color} strokeWidth="2.5"/>
      <path d="M24 14 C24 14 18 8 14 10 C10 12 12 18 24 14Z" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M24 14 C24 14 30 8 34 10 C38 12 36 18 24 14Z" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  ShoppingBag: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  Sparkle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
      <path d="M19 3l.7 2.3 2.3.7-2.3.7L19 9l-.7-2.3L16 6l2.3-.7z"/>
      <path d="M5 18l.7 2.3 2.3.7-2.3.7L5 24l-.7-2.3L2 21l2.3-.7z"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Heart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Truck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
    </svg>
  ),
  Scissors: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/>
      <line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
    </svg>
  ),
  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
};

// ── Data ─────────────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "Handcrafted with Love", "100% Handmade",
  "Made to Make You Smile", "New Collection Live", "Gift Wrapping Available",
  "Handcrafted with Love", "100% Handmade",
  "Made to Make You Smile", "New Collection Live", "Gift Wrapping Available",
];

const COLLECTIONS = [
  {
    name: "Bracelets",
    desc: "Wrap your wrist in something beautiful. From delicate pearls to bold boho stacks — every piece tells a story.",
    tag: "Bestseller",
    icon: Icons.BraceletColored('#f4a89a'),
  },
  {
    name: "Neck Chain",
    desc: "Step into summer with our handcrafted neck chain. Lightweight, dainty, and made to be worn every single day.",
    tag: "New In",
    icon: Icons.Anklet('#a8dbd6'),
  },
  {
    name: "Gift Sets",
    desc: "The perfect gift, beautifully packaged. Curated sets for birthdays, anniversaries, and every happy moment.",
    tag: "Trending",
    icon: Icons.GiftBox('#c9a227'),
  },
];

const WHY_ITEMS = [
  { icon: <Icons.Scissors />, title: "100% Handcrafted",    desc: "Every piece is made by hand with love, care, and attention to detail." },
  { icon: <Icons.Truck />,    title: "Free Shipping",       desc: "On all orders above ₹499. Pan-India delivery in 3–5 business days." },
  { icon: <Icons.Refresh />,  title: "Easy Returns",        desc: "Not happy? Return within 7 days — no questions asked." },
  { icon: <Icons.Shield />,   title: "Secure Payments",     desc: "UPI, COD — all transactions are 100% safe." },
];

const TESTIMONIALS = [
  { text: "I ordered the pearl bracelet and it arrived so beautifully packaged. The quality is amazing — I've gotten so many compliments!", name: "Ananya M.", location: "Mumbai", initials: "AM" },
  { text: "Gifted the rose quartz set to my best friend and she absolutely loved it. Will definitely be ordering again soon!", name: "Riya S.",   location: "Ahmedabad", initials: "RS" },
  { text: "Absolutely love the anklet. It's delicate, doesn't break, and looks gorgeous. TiedUpCreativity has a customer for life!", name: "Pooja K.", location: "Surat", initials: "PK" },
];

// ── LandingPage Component ────────────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="lp-page">

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">

          {/* Brand */}
          <div className="lp-brand">
            <div className="lp-brand-blob">
              <Icons.Bracelet />
            </div>
            <div className="lp-brand-text">
              <div className="lp-brand-name">TIED UP <span>with</span> CREATIVITY</div>
              <div className="lp-brand-tag">Made to make you smile</div>
            </div>
          </div>

          {/* Nav links */}
          <div className="lp-nav-links">
            <a href="#collections" className="lp-nav-link">Collections</a>
            <a href="#why-us"      className="lp-nav-link">Why Us</a>
            <a href="#reviews"     className="lp-nav-link">Reviews</a>
          </div>

          {/* Login CTA */}
          <button className="lp-login-btn" onClick={() => navigate('/login')}>
            <Icons.User /> Login
          </button>

          {/* Mobile hamburger */}
          <button className="lp-hamburger" aria-label="Menu">
            <span /><span /><span />
          </button>

        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="lp-hero">

        {/* Copy */}
        <div className="lp-hero-copy">
          <div className="lp-hero-eyebrow">
            <span className="lp-hero-eyebrow-dot" />
            Latest Collection 2026
          </div>

          <h1 className="lp-hero-title">
            <span className="lp-title-line">Jewellery that</span>
            <span className="lp-title-line">feels like <em>you</em></span>
          </h1>

          <p className="lp-hero-desc">
            Handcrafted bracelets and anklets made with intention.
            Each piece is one-of-a-kind — just like the person wearing it.
          </p>

          <div className="lp-hero-cta-row">
            <button className="lp-cta-primary" onClick={() => navigate('/login')}>
              <Icons.ShoppingBag /> Shop Now
            </button>
            <button className="lp-cta-secondary" onClick={() => document.getElementById('collections').scrollIntoView({ behavior: 'smooth' })}>
              Explore Collections <Icons.ArrowRight />
            </button>
          </div>

          <div className="lp-trust-row">
            <div className="lp-trust-item"><Icons.Check /> Handmade</div>
            <div className="lp-trust-sep" />
            <div className="lp-trust-item"><Icons.Heart /> Made with Love</div>
            <div className="lp-trust-sep" />
            <div className="lp-trust-item"><Icons.Sparkle /> Unique Pieces</div>
          </div>
        </div>

        {/* Mosaic image cards */}
        <div className="lp-hero-mosaic">

          {/* Card 1 — tall, bracelets */}
          <div className="lp-mosaic-card">
            <div className="lp-mosaic-img">
              <div className="lp-mosaic-badge">Bestseller</div>
              <div className="lp-mosaic-icon-wrap">
                {Icons.BraceletColored('#f4a89a')}
              </div>
              <div className="lp-mosaic-label">Pearl Cascade</div>
              <div className="lp-mosaic-sub">Bracelet · ₹549</div>
            </div>
          </div>

          {/* Card 2 — anklet */}
          <div className="lp-mosaic-card">
            <div className="lp-mosaic-img">
              <div className="lp-mosaic-badge">New In</div>
              <div className="lp-mosaic-icon-wrap">
                {Icons.Anklet('#a8dbd6')}
              </div>
              <div className="lp-mosaic-label">Golden Dew</div>
              <div className="lp-mosaic-sub">Anklet · ₹399</div>
            </div>
          </div>

          {/* Card 3 — gift set */}
          <div className="lp-mosaic-card">
            <div className="lp-mosaic-img">
              <div className="lp-mosaic-badge">Gift ✨</div>
              <div className="lp-mosaic-icon-wrap">
                {Icons.GiftBox('#c9a227')}
              </div>
              <div className="lp-mosaic-label">Rose Quartz Set</div>
              <div className="lp-mosaic-sub">Gift Set · ₹1,199</div>
            </div>
          </div>

        </div>
      </section>

      {/* ══ MARQUEE ═════════════════════════════════════════════════════════ */}
      <div className="lp-marquee-strip">
        <div className="lp-marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <span key={i} className="lp-marquee-item">
              <Icons.Sparkle /> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══ COLLECTIONS ═════════════════════════════════════════════════════ */}
      <section className="lp-collections" id="collections">
        <p className="lp-section-eyebrow">Our Collections</p>
        <h2 className="lp-section-title">Something for every <em>occasion</em></h2>

        <div className="lp-collections-grid">
          {COLLECTIONS.map((col) => (
            <div key={col.name} className="lp-col-card">
              <div className="lp-col-img">
                <span className="lp-col-tag">{col.tag}</span>
                <div className="lp-col-img-icon">{col.icon}</div>
              </div>
              <div className="lp-col-body">
                <h3 className="lp-col-name">{col.name}</h3>
                <p className="lp-col-desc">{col.desc}</p>
                <span className="lp-col-link" onClick={() => navigate('/login')}>
                  Shop {col.name} <Icons.ArrowRight />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ WHY US ══════════════════════════════════════════════════════════ */}
      <section className="lp-why" id="why-us">
        <div className="lp-why-inner">
          {WHY_ITEMS.map((w) => (
            <div key={w.title} className="lp-why-item">
              <div className="lp-why-icon">{w.icon}</div>
              <h3 className="lp-why-title">{w.title}</h3>
              <p className="lp-why-desc">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════ */}
      <section className="lp-testimonials" id="reviews">
        <p className="lp-section-eyebrow">Happy Customers</p>
        <h2 className="lp-section-title">Made to make you <em>smile</em></h2>

        <div className="lp-testi-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="lp-testi-card">
              <div className="lp-testi-stars">
                {[...Array(5)].map((_, i) => <Icons.Star key={i} />)}
              </div>
              <p className="lp-testi-text">"{t.text}"</p>
              <div className="lp-testi-author">
                <div className="lp-testi-avatar">{t.initials}</div>
                <div>
                  <div className="lp-testi-name">{t.name}</div>
                  <div className="lp-testi-location">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════════════════ */}
      <section className="lp-cta-banner">
        <div className="lp-cta-banner-inner">
          <div className="lp-cta-banner-copy">
            <h2 className="lp-cta-banner-title">
              Ready to find your<br /><em>perfect piece?</em>
            </h2>
            <p className="lp-cta-banner-sub">
              Join hundreds of happy customers and discover handcrafted jewellery
              made with love, just for you.
            </p>
          </div>
          <div className="lp-cta-banner-action">
            <button className="lp-cta-primary" onClick={() => navigate('/login')}>
              <Icons.ShoppingBag /> Start Shopping
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-top">

          {/* Brand col */}
          <div>
            <div className="lp-footer-brand-name">TIED UP <span>with</span> CREATIVITY</div>
            <div className="lp-footer-tagline">Made to make you smile</div>
            <p className="lp-footer-brand-desc">
              Handcrafted jewellery made with love from Vadodara, Gujarat.
              Every piece is unique — just like you.
            </p>
            <div className="lp-footer-socials">
              <button className="lp-social-btn" aria-label="Instagram"><Icons.Instagram /></button>
              <button className="lp-social-btn" aria-label="Twitter"><Icons.Twitter /></button>
              <button className="lp-social-btn" aria-label="Facebook"><Icons.Facebook /></button>
            </div>
          </div>

          {/* Shop col */}
          <div>
            <p className="lp-footer-col-title">Shop</p>
            <ul className="lp-footer-links">
              <li><a href="#collections">Bracelets</a></li>
              <li><a href="#collections">Anklets</a></li>
              <li><a href="#collections">Gift Sets</a></li>
              <li><a href="#collections">Charms</a></li>
              <li><a href="#collections">Rings</a></li>
            </ul>
          </div>

          {/* Help col */}
          <div>
            <p className="lp-footer-col-title">Help</p>
            <ul className="lp-footer-links">
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Returns & Exchanges</a></li>
              <li><a href="#">Track My Order</a></li>
            </ul>
          </div>

          {/* About col */}
          <div>
            <p className="lp-footer-col-title">About</p>
            <ul className="lp-footer-links">
              <li><a href="#">Our Story</a></li>
            </ul>
          </div>

        </div>

        <div className="lp-footer-bottom">
          <p className="lp-footer-copy">
            © 2026 <span>TiedUpCreativity</span>. All rights reserved. Made with ♥ in India.
          </p>
          <div className="lp-footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;