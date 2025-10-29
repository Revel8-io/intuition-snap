import { Box, Text, Link, Button } from '@metamask/snaps-sdk/jsx';
import { VENDOR_LIST, type Vendor } from './vendors';
import { AccountProps, AccountType, OriginType } from './types';

type CallToActionProps = AccountProps & {
  method: AccountType | string;
};

export const CallToAction = (props: CallToActionProps) => {
  const { method } = props;
  const links = VENDOR_LIST.map((vendor: Vendor) => {
    const linkGenerator = vendor[method];
    if (!linkGenerator) return null;
    const { url } = linkGenerator(props as any); // Type assertion needed for vendor function
    return <Link href={url}>{vendor.name}</Link>;
  });
  return (
    <Box>
      <Text>Choose an app to complete your action:</Text>
      {links}
      <Button name="account_renderOnTransaction">Back</Button>
    </Box>
  );
};

// Origin-specific call to action component
export const OriginCallToAction = (props: CallToActionProps) => {
  const { method } = props;
  const links = VENDOR_LIST.map((vendor: Vendor) => {
    const linkGenerator = vendor[method as string];
    if (!linkGenerator) return null;
    try {
      const { url } = linkGenerator(props);
      return <Link href={url}>{vendor.name}</Link>;
    } catch (e) {
      console.error(`Error generating link for ${vendor.name}:`, e);
      return null;
    }
  }).filter(Boolean);

  return (
    <Box>
      <Text>Choose an app to complete your action:</Text>
      {links}
      <Button name="account_renderOnTransaction">Back</Button>
    </Box>
  );
};

const NoAccount = CallToAction;
const AccountWithoutTrustData = CallToAction;
const AccountWithTrustData = CallToAction;
const AccountWithoutAtom = CallToAction;

// Origin-specific CTAs
const OriginNoAtom = OriginCallToAction;
const OriginAtomWithoutTrust = OriginCallToAction;
const OriginAtomWithTrust = OriginCallToAction;

export const rate = {
  [AccountType.AccountWithoutTrustData]: AccountWithoutTrustData,
  [AccountType.AccountWithTrustData]: AccountWithTrustData,
  [AccountType.NoAccount]: NoAccount,
  [AccountType.AccountWithoutAtom]: AccountWithoutAtom,

  // Origin-specific methods
  [`origin_${OriginType.NoAtom}`]: OriginNoAtom,
  [`origin_${OriginType.AtomWithoutTrust}`]: OriginAtomWithoutTrust,
  [`origin_${OriginType.AtomWithTrust}`]: OriginAtomWithTrust,
};
