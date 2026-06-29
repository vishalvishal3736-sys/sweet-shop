// lib/config.ts

export const SHOP_CONFIG = {
  // The name of the shop – appears in the header, meta tags, etc.
  name: "The Sweets Shop",

  // Currency symbol used throughout the site.
  currency: "₹",

  // Primary brand color (e.g., for buttons, links). Use a valid hex code.
  themeColor: "#ef4444",

  // Fallback WhatsApp number in case the database setting isn't loaded yet.
  // Format: country code + number (no + or spaces).
  fallbackWhatsAppNumber: "999999XXXX",

  // Shop contact information
  contactEmail: "contact@sweetshop.com",
  phoneNumber: "+91 9876543210",

  // Address for pickup orders
  shopAddress: "123 Sweet Street, Market Area, City - 123456",

  // Business hours
  businessHours: "9:00 AM - 9:00 PM",

  // Delivery settings
  minDeliveryOrder: 200, // Minimum order amount for delivery
  freeDeliveryAbove: 1000, // Free delivery above this amount
};

// Centralized product categories – used in the admin dashboard and storefront
export const PRODUCT_CATEGORIES = [
  "Sweets",
  "Namkeen",
  "Sugar-Free",
  "Festive Specials",
  "Gifts",
];