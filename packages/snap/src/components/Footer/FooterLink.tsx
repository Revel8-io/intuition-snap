import { Box, Link, Text } from '@metamask/snaps-sdk/jsx';

export type FooterLinkProps = {
  /** The URL to link to */
  href: string;
  /** The display text for the link */
  label: string;
  /** Optional emoji/icon prefix */
  icon?: string;
};

/**
 * Reusable footer link component with consistent styling.
 * Provides a uniform appearance for all CTA links in the footer.
 */
export const FooterLink = ({ href, label }: FooterLinkProps) => {

  return (
    <Box>
      <Link href={href}>
        {label}
      </Link>
    </Box>
  );
};

