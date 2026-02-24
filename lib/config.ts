// lib/config.ts

export const SHOP_CONFIG = {
  // The name of the shop – appears in the header, meta tags, etc.
  name: "Girish Sweets",

  // The email address of the shop owner (admin). Used in RLS policies
  // to grant write access to the dashboard.
  adminEmail: "abc@gmail.com",

  // Currency symbol used throughout the site.
  currency: "₹",

  // Primary brand color (e.g., for buttons, links). Use a valid hex code.
  themeColor: "#ef4444",

  // Fallback WhatsApp number in case the database setting isn't loaded yet.
  // Format: country code + number (no + or spaces).
  fallbackWhatsAppNumber: "918619418106",
};