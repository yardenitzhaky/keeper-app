import React from "react";
import { 
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  Copyright as CopyrightIcon,
  Language as WebsiteIcon  // Added for portfolio link
} from '@mui/icons-material';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    {
      icon: <WebsiteIcon fontSize="small" />,
      url: "https://yardenitzhaky.github.io/Portfolio/",  // Your portfolio URL
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

  return (
    <footer>
      <div className="footer-content">
        <div className="social-links">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="social-icon"
              title={link.label}  // Added tooltip
            >
              {link.icon}
            </a>
          ))}
        </div>
        <p className="copyright">
          <CopyrightIcon fontSize="small" />
          <span>{currentYear}</span>
          <span className="separator">|</span>
          <span className="creator">Created by Yarden Itzhaky</span>
        </p>
      </div>
    </footer>
  );
}

export default Footer;