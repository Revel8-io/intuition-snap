import { Box, Text, Link, Button } from '@metamask/snaps-sdk/jsx';
import { VENDOR_LIST, type Vendor } from './vendors';
import { AccountProps, AccountType } from './types';

type CallToActionProps = AccountProps & {
  method: AccountType;
};

export const CallToAction = (props: CallToActionProps) => {
  console.log('CallToAction props', props);
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

const NoAccount = CallToAction;
const AccountWithoutTrustData = CallToAction;
const AccountWithTrustData = CallToAction;

export const rate = {
  [AccountType.AccountWithoutTrustData]: AccountWithoutTrustData,
  [AccountType.AccountWithTrustData]: AccountWithTrustData,
  [AccountType.NoAccount]: NoAccount,
};
