// lib/config.ts

export const SHOP_CONFIG = {
  // The name of the shop – appears in the header, meta tags, etc.
  name: "Girish Sweets",

  // Currency symbol used throughout the site.
  currency: "₹",

  // Primary brand color (e.g., for buttons, links). Use a valid hex code.
  themeColor: "#ef4444",

  // Fallback WhatsApp number in case the database setting isn't loaded yet.
  // Format: country code + number (no + or spaces).
  fallbackWhatsAppNumber: "918619418106",
};

// Centralized product categories – used in the admin dashboard and storefront
export const PRODUCT_CATEGORIES = [
  "Sweets",
  "Namkeen",
  "Sugar-Free",
  "Festive Specials",
  "Gifts",
];