/**
 * Main entry point tests for the Revel8 Snap.
 *
 * This file contains tests for the snap's exported handlers:
 * - onHomePage: Renders the snap's home page
 * - onTransaction: Provides transaction insights (see onTransaction.test.tsx)
 * - onUserInput: Handles user interactions (currently inert)
 */

import { expect, describe, it } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

describe('Snap Handlers', () => {
  describe('onHomePage', () => {
    it('should render the home page with welcome content', async () => {
      const snap = await installSnap();

      const response = await snap.onHomePage();

      // Home page should return a valid interface
      const ui = response.getInterface();
      expect(ui).toBeDefined();
      expect(ui.content).toBeDefined();

      // Verify the content structure
      const content = ui.content as { type: string; props: any };
      expect(content.type).toBe('Box');

      // Check for welcome text
      const rendered = JSON.stringify(ui.content);
      expect(rendered).toContain('Revel8');
      expect(rendered).toContain('trust');
    });

    it('should include a link to Revel8 and Intuition', async () => {
      const snap = await installSnap();

      const response = await snap.onHomePage();
      const ui = response.getInterface();
      const rendered = JSON.stringify(ui.content);

      expect(rendered).toContain('revel8.io');
      expect(rendered).toContain('intuition.systems');
      expect(rendered).toContain('Link');
    });
  });

  describe('onTransaction', () => {
    it('should be available and return an interface', async () => {
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
        to: '0x1234567890123456789012345678901234567890',
        chainId: 'eip155:1',
        data: '0x',
        value: '0x0',
      });

      expect(response.getInterface()).toBeDefined();
    });
  });
});
