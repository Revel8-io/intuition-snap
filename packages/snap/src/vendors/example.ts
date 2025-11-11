import { AccountType, PropsForAccountType } from '../types';
import { type Vendor } from '.';
import { chainConfig } from '../config';
import { addressToCaip10 } from '../util';

/**
 * Example vendor implementation
 *
 * This file demonstrates how to create a vendor integration for the Intuition Snap.
 * Copy this file and modify it for your own application.
 */

// Define your chain-specific base URLs
const CHAIN_URLS: Record<number, string> = {
  13579: 'https://app.example.com',          // Intuition Mainnet
  1155: 'https://testnet.app.example.com',   // Intuition Testnet
};

// Get the appropriate base URL for the current chain
const baseUrl = CHAIN_URLS[chainConfig.chainId] || CHAIN_URLS[13579];

export const exampleVendor: Vendor = {
  name: 'Example App',
  logo: 'https://app.example.com/logo.svg', // must be SVG (inline?)

  /**
   * Called when no atom exists for the transaction address
   * Direct users to create an atom (on-chain identity)
   */
  [AccountType.NoAtom]: (params) => {
    const { address, chainId, isContract } = params;

    // Smart contracts should use CAIP-10 format (includes chain)
    // EOAs (regular wallets) use plain address format
    const addressToUse = isContract
      ? addressToCaip10(address, chainId)
      : address;

    // Build your URL with relevant parameters
    return {
      url: `${baseUrl}/create-atom?address=${addressToUse}&chain=${chainId}`,
    };
  },

  /**
   * Called when an atom exists but no trust triple
   * Direct users to create a trust relationship
   */
  [AccountType.AtomWithoutTrustTriple]: (params) => {
    const { account } = params;

    // The snap uses specific predicate/object atoms for trust relationships
    const { isAtomId, trustworthyAtomId } = chainConfig;

    // Create triple: [account] --is--> [trustworthy]
    return {
      url: `${baseUrl}/create-triple?subject=${account.term_id}&predicate=${isAtomId}&object=${trustworthyAtomId}`,
    };
  },

  /**
   * Called when both atom and trust triple exist
   * Direct users to stake on the existing relationship
   */
  [AccountType.AtomWithTrustTriple]: (params) => {
    const { triple } = params;

    // Users can stake to support or oppose the relationship
    return {
      url: `${baseUrl}/stake?triple=${triple.term_id}&direction=support`,
    };
  },
};

// Note: To use this vendor, add it to VENDOR_LIST in ./index.ts
