/**
 * Trusted Circle UI Component.
 *
 * Displays which of the user's trusted contacts have positions
 * on the current address/origin trust triple.
 *
 * @module components/TrustedCircle
 */

import { Row, Text, Heading, Section, Bold } from '@metamask/snaps-sdk/jsx';
import type { TrustedContact, TrustedCirclePositions } from '../trusted-circle/types';

/**
 * Maximum number of contacts to display per section.
 * Additional contacts are summarized with "+N more".
 */
const MAX_DISPLAY_CONTACTS = 3;

/**
 * Formats a list of contacts for display.
 * Shows up to MAX_DISPLAY_CONTACTS with "+N more" suffix if needed.
 *
 * @param contacts - Array of trusted contacts
 * @returns Formatted string like "alice.eth, bob.eth +2 more"
 */
function formatContactList(contacts: TrustedContact[]): string {
  if (contacts.length === 0) {
    return '';
  }

  const displayContacts = contacts.slice(0, MAX_DISPLAY_CONTACTS);
  const labels = displayContacts.map((c) => formatLabel(c.label));

  if (contacts.length > MAX_DISPLAY_CONTACTS) {
    const remaining = contacts.length - MAX_DISPLAY_CONTACTS;
    return `${labels.join(', ')} +${remaining} more`;
  }

  return labels.join(', ');
}

/**
 * Formats a label for display.
 * Truncates long addresses but preserves ENS names.
 *
 * @param label - The contact's label
 * @returns Formatted label
 */
function formatLabel(label: string): string {
  // If it looks like a full address (0x + 40 hex chars), truncate it
  if (/^0x[a-fA-F0-9]{40}$/u.test(label)) {
    return `${label.slice(0, 6)}...${label.slice(-4)}`;
  }

  // If it's a CAIP-10 address, extract and truncate just the address part
  if (label.startsWith('caip10:')) {
    const parts = label.split(':');
    const address = parts[parts.length - 1];
    if (address && /^0x[a-fA-F0-9]{40}$/u.test(address)) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
  }

  // Otherwise return as-is (ENS, labels, etc.)
  return label;
}

/**
 * Props for TrustedCircleSection component.
 */
export interface TrustedCircleSectionProps extends TrustedCirclePositions {}

/**
 * Displays the user's trusted contacts who have positions on the current triple.
 *
 * Shows FOR and AGAINST sections separately.
 * Hides entirely if no trusted contacts have positions.
 *
 * @param props - Component props with forContacts and againstContacts
 * @returns JSX element or null
 */
export const TrustedCircleSection = ({
  forContacts,
  againstContacts,
}: TrustedCircleSectionProps) => {
  // Hide section entirely if no trusted contacts have positions
  if (forContacts.length === 0 && againstContacts.length === 0) {
    return null;
  }

  return (
    <Section>
      <Heading size="sm">Your Trust Circle</Heading>

      {forContacts.length > 0 && (
        <Row label="FOR">
          <Text color="success">
            <Bold>{formatContactList(forContacts)}</Bold>
          </Text>
        </Row>
      )}

      {againstContacts.length > 0 && (
        <Row label="AGAINST">
          <Text color="warning">
            <Bold>{formatContactList(againstContacts)}</Bold>
          </Text>
        </Row>
      )}
    </Section>
  );
};

