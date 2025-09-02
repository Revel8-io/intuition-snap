import { Box, Text, Link, Button } from '@metamask/snaps-sdk/jsx';
import { VENDORS, type Vendor } from './vendors';

type CallToActionProps = {
  id: string;
  event: any;
  context: any;
};

export const CallToAction = (props) => {
  console.group('CallToAction');
  console.log('props', JSON.stringify(props));
  const { method } = props;
  console.log('method', method);
  const links = Object.values(VENDORS).map((vendor) => {
    const renderFn = vendor[method as keyof Vendor];
    if (!renderFn) return null;
    console.log('vendor->renderFn', renderFn);
    const { url } = renderFn(props);
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
const accountAtomNoTrustData = CallToAction;
const accountAtomTrustData = CallToAction;

export const rate = {
  accountAtomNoTrustData,
  accountAtomTrustData,
  noAccount,
};

export const cta = {
  rate,
};
