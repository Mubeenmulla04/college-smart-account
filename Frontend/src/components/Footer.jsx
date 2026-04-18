import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footerContainer}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <h3 className={styles.logoText}>College Smart Account</h3>
        <p className={styles.tagline}>
          Simplifying student account management with clarity and ease.
        </p>
      </div>

      {/* Navigation Links */}
      <nav className={styles.navLinks}>
        {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map((item) => (
          <a key={item} href="#" className={styles.navLink}>
            {item}
          </a>
        ))}
      </nav>

      {/* Newsletter Form */}
      <div className={styles.newsletterSection}>
        <p className={styles.newsletterText}>Stay in the loop with our updates</p>
        <div className={styles.newsletterForm}>
          <input
            type="email"
            placeholder="Enter your email"
            className={styles.newsletterInput}
          />
          <button className={styles.newsletterButton}>Join</button>
        </div>
      </div>

      {/* Contact Info */}
      <div className={styles.contactSection}>
        <div className={styles.inlineFlex}><p className={styles.contactItem}>
          <span className={styles.contactIcon}>📧</span> info@collegesmart.edu
        </p>
        <p className={styles.contactItem}>
          <span className={styles.contactIcon}>📞</span> (937) 073-4943
        </p></div>
        <p className={styles.contactItem}>
          <span className={styles.contactIcon}>📍</span> Bharat Ratna Indira Gandhi
          College of Engineering, Kegaon, Solapur
        </p>
      </div>

      {/* Social Icons */}
      <div className={styles.socialSection}>
        {[
          { icon: FaFacebookF, color: styles.facebookHover, link: "#" },
          { icon: FaTwitter, color: styles.twitterHover, link: "#" },
          { icon: FaInstagram, color: styles.instagramHover, link: "#" },
          { icon: FaLinkedinIn, color: styles.linkedinHover, link: "#" },
        ].map((social, index) => (
          <a
            key={index}
            href={social.link}
            className={`${styles.socialLink} ${social.color}`}
            aria-label={social.icon.name}
          >
            <social.icon size={18} />
          </a>
        ))}
      </div>

      {/* Copyright */}
      <div className={styles.copyrightSection}>
        <p className={styles.copyrightText}>
          © 2025 College Smart Account. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;