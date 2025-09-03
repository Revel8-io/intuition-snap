import { Box, Text, Link, Button } from '@metamask/snaps-sdk/jsx';
import { VENDORS, type Vendor } from './vendors';
import { Identity } from './types';

export type CallToActionProps = Identity & {
  method: string;
};

export const CallToAction = (props: CallToActionProps) => {
  console.group('CallToAction');
  console.log('props', JSON.stringify(props, null, 2));
  const { method } = props;
  console.log('method', method);
  const links = Object.values(VENDORS).map((vendor) => {
    const linkGenerator = vendor[method as keyof Vendor];
    if (!linkGenerator) return null;
    console.log('vendor->linkGenerator', linkGenerator);
    const { url } = linkGenerator(props);
    return <Link href={url}>{vendor.name}</Link>;
  });
  console.log('CallToAction links', links);
  console.groupEnd();
  return (
    <Box>
      <Text>Choose an app to complete your action:</Text>
      {links}
      <Button name="account_renderOnTransaction">Back</Button>
    </Box>
  );
};

const noAccount = CallToAction;
const accountWithoutTrustData = CallToAction;
const accountWithTrustData = CallToAction;

export const rate = {
  accountWithoutTrustData,
  accountWithTrustData,
  noAccount,
};

export const cta = {
  rate,
};
