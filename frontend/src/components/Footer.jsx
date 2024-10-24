/**
 * Footer Component
 * Displays a fixed footer with social links and copyright information
 * @component
 * @version 1.0.0
 */

import React from "react";

// Material-UI Icons for social links and copyright
import {
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  Copyright as CopyrightIcon,
  Language as WebsiteIcon
} from '@mui/icons-material';

const Footer = () => {
  // ============================================================================
  // CONSTANTS AND CONFIGURATIONS
  // ============================================================================
  
  // Get current year for copyright notice
  const currentYear = new Date().getFullYear();

  /**
   * Configuration for social media links and contact information
   * Each object contains icon, URL, and label for accessibility
   */
  const socialLinks = [
    {
      icon: <WebsiteIcon fontSize="small" />,
      url: "https://yardenitzhaky.github.io/Portfolio/",
      label: "Portfolio"
    },
    {
      icon: <LinkedInIcon fontSize="small" />,
      url: "https://www.linkedin.com/in/yardenitzhaky",
      label: "LinkedIn"
    },
    {
      icon: <GitHubIcon fontSize="small" />,
      url: "https://github.com/yardenitzhaky",
      label: "GitHub"
    },
    {
      icon: <EmailIcon fontSize="small" />,
      url: "mailto:yardene015@gmail.com",
      label: "Email"
    }
  ];

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <footer>
      <div className="footer-content">
        {/* Social Links Section */}
        <div className="social-links">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="social-icon"
              title={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>

        {/* Copyright Section */}
        <p className="copyright">
          <CopyrightIcon fontSize="small" />
          <span>{currentYear}</span>
          <span className="separator">|</span>
          <span className="creator">Created by Yarden Itzhaky</span>
        </p>
      </div>
    </footer>
  );
};

// PropTypes could be added here if component accepts props in the future

export default Footer;