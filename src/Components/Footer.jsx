import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logoimg/image.png"; // UPDATED: Using a placeholder logo URL for guaranteed load.    

// --- ICONS ---
// I've kept your icon imports, they are perfect.
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { MdPhone, MdEmail, MdLocationOn } from "react-icons/md";

// --- Animation Variants ---
const footerVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
      staggerChildren: 0.1,
    },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function Footer() {
  // Using the placeholder logo you provided for a guaranteed load.
  // You can swap this back to `import logo from "..."` if your path is correct.
  const logoUrl = logo;

  const quickLinks = [
    { name: "Home", to: "/" },
    { name: "About Us", to: "/about" },
    { name: "Visa Services", to: "/visas" }, // Updated text for clarity
    { name: "File Processing", to: "/fileprocessing" }, // Updated text
    { name: "Contact", to: "/contact" },
  ];

  const servicesLinks = [
    { name: "Schengen Visa", to: "/fileprocessing" },
    { name: "USA/UK Visa", to: "/fileprocessing" },
    { name: "Asia E-Visas", to: "/visas" },
    { name: "Flight Tickets", to: "/" }, // Assuming these link to relevant pages
    { name: "Hotel Bookings", to: "/" },
  ];

  const socialLinks = [
    { icon: <FaFacebookF />, href: "#", label: "Facebook" },
    { icon: <FaTwitter />, href: "#", label: "Twitter" },
    { icon: <FaInstagram />, href: "#", label: "Instagram" },
    { icon: <FaLinkedinIn />, href: "#", label: "LinkedIn" },
  ];

  return (
    // UPDATED: Changed to a rich, dark background for a more modern, premium feel.
    <motion.footer
      variants={footerVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="bg-gray-900 text-gray-300"
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* UPDATED: Increased gap for better spacing on all screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Logo, About, Socials */}
          <motion.div variants={itemVariant} className="space-y-6">
            <Link to="/">
              {/* Using the placeholder URL. Replace `logoUrl` with `logo` if your import works */}
              <img src={logoUrl} alt="O.S Travel & Tours" className="h-10 rounded" />
            </Link>
            <p className="text-sm text-gray-400">
              Your partner in creating unforgettable adventures. We are committed
              to delivering the highest level of service.
            </p>
            {/* UPDATED: Icon styling. Now circular with a hover effect. */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-blue-600 hover:scale-110 transform transition-all duration-300"
                  aria-label={`Follow us on ${social.label}`}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Quick Links */}
          <motion.div variants={itemVariant}>
            <h5 className="font-bold text-white uppercase mb-4">Quick Links</h5>
            <nav className="flex flex-col space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  // UPDATED: Added a subtle left-movement hover effect
                  className="text-gray-300 hover:text-blue-400 hover:translate-x-1 transition-all duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Column 3: Services */}
          <motion.div variants={itemVariant}>
            <h5 className="font-bold text-white uppercase mb-4">Our Services</h5>
            <nav className="flex flex-col space-y-3">
              {servicesLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  // UPDATED: Added a subtle left-movement hover effect
                  className="text-gray-300 hover:text-blue-400 hover:translate-x-1 transition-all duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Column 4: Contact Info */}
          <motion.div variants={itemVariant} className="space-y-4">
            <h5 className="font-bold text-white uppercase mb-4">Get in Touch</h5>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                {/* UPDATED: Icons are larger and a consistent accent color */}
                <MdLocationOn className="text-2xl text-blue-500 mt-1 shrink-0" />
                <span className="text-sm">
                  Office # 3, Aaly Plaza, Fazal e Haq Rd, Block E G 6/2 Blue Area,
                  Islamabad
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MdPhone className="text-2xl text-blue-500 mt-1 shrink-0" />
                {/* UPDATED: Cleaned up the flex layout for phone numbers */}
                <div className="flex flex-col">
                  <a href="tel:0512120700" className="text-sm hover:text-blue-400 transition-colors duration-300">
                    051-2120700-701
                  </a>
                  <a href="tel:03335542877" className="text-sm hover:text-blue-400 transition-colors duration-300">
                    0333-5542877
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MdEmail className="text-2xl text-blue-500 mt-1 shrink-0" />
                <a href="mailto:info@ostravels.com" className="text-sm hover:text-blue-400 transition-colors duration-300">
                  info@ostravels.com
                </a>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar: Copyright */}
      {/* UPDATED: Changed background to be a shade darker than the footer for a subtle effect */}
      <div className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* This is already responsive, stacking on mobile and row on desktop */}
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} O.S Travel & Tours. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="hover:text-gray-300 transition-colors duration-300">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;