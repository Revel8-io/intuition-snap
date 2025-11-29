/**
 * Vendor Configuration Export
 *
 * Imports from vendor.config.ts (git-ignored, developer-owned).
 * See vendor.config.example.ts for the reference implementation.
 */

import { vendorConfig, type VendorConfig } from './vendor.config';

// Re-export types for use elsewhere
export type { VendorConfig };

// Export the vendor configuration
export const vendor = vendorConfig;

// Legacy export for backwards compatibility
export const VENDOR_LIST = [vendorConfig];
