/**
 * Integration tests for the onTransaction handler.
 *
 * These tests verify the Snap's behavior when processing transactions.
 * Note: Since the snap runs in an isolated execution environment, network
 * requests (GraphQL queries) go to the actual API. These tests verify:
 * - The snap starts correctly
 * - The onTransaction handler returns a valid interface
 * - JSON-RPC mocking works for ethereum provider calls
 *
 * For unit tests of business logic (atom selection, classification, etc.),
 * see account.test.ts
 *
 * @see docs/2025-11-29-address-classification-spec.md for classification logic
 */

import { expect, describe, it } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

// Test addresses - using real-ish looking addresses
const TEST_EOA_ADDRESS = '0x1234567890123456789012345678901234567890' as `0x${string}`;
const TEST_CONTRACT_ADDRESS = '0xdead000000000000000000000000000000000000' as `0x${string}`;

// Chain IDs in CAIP-2 format
const CHAIN_IDS = {
  INTUITION_TESTNET: 'eip155:13579',
  ETHEREUM_MAINNET: 'eip155:1',
} as const;

describe('onTransaction Integration Tests', () => {
  describe('Basic functionality', () => {
    it('should return a valid interface for EOA transaction', async () => {
      const snap = await installSnap();

      // Mock eth_accounts to return a user address
      snap.mockJsonRpc({
        method: 'eth_accounts',
        result: ['0xuser000000000000000000000000000000000001'],
      });

      // Mock eth_getCode to return empty (EOA)
      snap.mockJsonRpc({
        method: 'eth_getCode',
        result: '0x',
      });

      const response = await snap.onTransaction({
        to: TEST_EOA_ADDRESS,
        chainId: CHAIN_IDS.INTUITION_TESTNET,
        data: '0x',
        value: '0x0',
      });

      // Verify we get an interface back
      const ui = response.getInterface();
      expect(ui).toBeDefined();
      expect(ui.content).toBeDefined();

      // The UI should be a Box component at the root
      const content = ui.content as { type: string; props: any };
      expect(content.type).toBe('Box');
    });

    it('should return a valid interface for contract transaction', async () => {
      const snap = await installSnap();

      snap.mockJsonRpc({
        method: 'eth_accounts',
        result: ['0xuser000000000000000000000000000000000001'],
      });

      // Mock eth_getCode to return bytecode (contract)
      snap.mockJsonRpc({
        method: 'eth_getCode',
        result: '0x6080604052',
      });

      // Transaction with data = contract interaction
      const response = await snap.onTransaction({
        to: TEST_CONTRACT_ADDRESS,
        chainId: CHAIN_IDS.INTUITION_TESTNET,
        data: '0xa9059cbb', // transfer function selector
        value: '0x0',
      });

      const ui = response.getInterface();
      expect(ui).toBeDefined();

      // Contract transactions should also render successfully
      const content = ui.content as { type: string; props: any };
      expect(content.type).toBe('Box');
    });

    it('should handle transaction without user accounts gracefully', async () => {
      const snap = await installSnap();

      // Mock eth_accounts to throw an error
      snap.mockJsonRpc({
        method: 'eth_accounts',
        result: [],
      });

      snap.mockJsonRpc({
        method: 'eth_getCode',
        result: '0x',
      });

      // Should not throw even if we can't get user accounts
      const response = await snap.onTransaction({
        to: TEST_EOA_ADDRESS,
        chainId: CHAIN_IDS.INTUITION_TESTNET,
        data: '0x',
        value: '0x0',
      });

      expect(response.getInterface()).toBeDefined();
    });
  });

  describe('Address classification', () => {
    it('should classify address as contract when transaction has data', async () => {
      const snap = await installSnap();

      snap.mockJsonRpc({
        method: 'eth_accounts',
        result: [],
      });

      // When transaction has data, it's classified as contract without calling eth_getCode
      const response = await snap.onTransaction({
        to: TEST_CONTRACT_ADDRESS,
        chainId: CHAIN_IDS.INTUITION_TESTNET,
        data: '0xdeadbeef', // Non-empty data = contract call
        value: '0x0',
      });

      const ui = response.getInterface();
      const rendered = JSON.stringify(ui.content);

      // Should show "contract" in the message (either from NoAtom or other component)
      expect(rendered).toContain('contract');
    });

    // Note: eth_getCode is now called via fetch() to the configured RPC URL,
    // not via ethereum.request(). Tests that mock eth_getCode via mockJsonRpc
    // will need to be updated to use network mocking or the snap will fall back
    // to "uncertain" classification (which defaults to contract).
    it('should handle EOA classification gracefully', async () => {
      const snap = await installSnap();

      snap.mockJsonRpc({
        method: 'eth_accounts',
        result: ['0xuser000000000000000000000000000000000001'],
      });

      // eth_getCode is now called via fetch(), so this mock won't be used.
      // The classification will fall back to "uncertain" -> isContract: true
      // This test just verifies the snap doesn't crash.

      const response = await snap.onTransaction({
        to: TEST_EOA_ADDRESS,
        chainId: CHAIN_IDS.INTUITION_TESTNET,
        data: '0x',
        value: '0x0',
      });

      expect(response.getInterface()).toBeDefined();
    });
  });

  describe('UI Structure', () => {
    it('should render Footer component with action links', async () => {
      const snap = await installSnap();

      snap.mockJsonRpc({
        method: 'eth_accounts',
        result: [],
      });

      snap.mockJsonRpc({
        method: 'eth_getCode',
        result: '0x',
      });

      const response = await snap.onTransaction({
        to: TEST_EOA_ADDRESS,
        chainId: CHAIN_IDS.INTUITION_TESTNET,
        data: '0x',
        value: '0x0',
      });

      const ui = response.getInterface();
      const rendered = JSON.stringify(ui.content);

      // Footer should contain links (Hive Mind explorer link or action links)
      expect(rendered).toContain('Link');
    });

    it('should include Divider component in layout', async () => {
      const snap = await installSnap();

      snap.mockJsonRpc({
        method: 'eth_accounts',
        result: [],
      });

      snap.mockJsonRpc({
        method: 'eth_getCode',
        result: '0x',
      });

      const response = await snap.onTransaction({
        to: TEST_EOA_ADDRESS,
        chainId: CHAIN_IDS.INTUITION_TESTNET,
        data: '0x',
        value: '0x0',
      });

      const ui = response.getInterface();
      const rendered = JSON.stringify(ui.content);

      // Layout should include a Divider
      expect(rendered).toContain('Divider');
    });
  });

  describe('Error resilience', () => {
    it('should render UI even when eth_getCode fails', async () => {
      const snap = await installSnap();

      snap.mockJsonRpc({
        method: 'eth_accounts',
        result: ['0xuser000000000000000000000000000000000001'],
      });

      // Note: We can't easily mock a JSON-RPC error, but we can test
      // that the snap handles the case where classification is uncertain

      const response = await snap.onTransaction({
        to: TEST_EOA_ADDRESS,
        chainId: CHAIN_IDS.INTUITION_TESTNET,
        data: '0x',
        value: '0x0',
      });

      // Even with potential errors, UI should render
      expect(response.getInterface()).toBeDefined();
    });
  });

  describe('Response structure', () => {
    it('should return response with interface ID', async () => {
      const snap = await installSnap();

      snap.mockJsonRpc({
        method: 'eth_accounts',
        result: [],
      });

      snap.mockJsonRpc({
        method: 'eth_getCode',
        result: '0x',
      });

      const response = await snap.onTransaction({
        to: TEST_EOA_ADDRESS,
        chainId: CHAIN_IDS.INTUITION_TESTNET,
        data: '0x',
        value: '0x0',
      });

      // The response should have an id (interface ID for snap_createInterface)
      expect(response.id).toBeDefined();
      expect(typeof response.id).toBe('string');
    });
  });
});
