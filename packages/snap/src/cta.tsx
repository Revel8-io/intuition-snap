import { Box, Text, Link, Button } from '@metamask/snaps-sdk/jsx';
import { VENDORS, type Vendor } from './vendors';

export type OnTransactionProps = {
  context: {
    address: string;
    chainId: string;
    account?: { atom_id: string };
    initialUI?: any;
    triple?: { term_id: string };
  };
  method: string;
};

export const CallToAction = (props: OnTransactionProps) => {
  const { method } = props;
  const links = Object.values(VENDORS).map((vendor) => {
    const renderFn = vendor[method as keyof Vendor];
    if (!renderFn) return null;
    const { url } = renderFn(props);
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

const accountAtomNoTrustData = CallToAction;
const accountAtomTrustData = CallToAction;

export const rate = {
  accountAtomNoTrustData,
  accountAtomTrustData,
};

export const cta = {
  rate,
};
