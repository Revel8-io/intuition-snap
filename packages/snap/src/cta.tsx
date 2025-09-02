import { Box, Text, Link, Button } from '@metamask/snaps-sdk/jsx';
import { VENDORS } from './vendors';

export const noAccount = (props) => {};

export const accountNoAtom = (props) => {};

export const accountAtomNoTrustData = (props) => {
  console.log('accountAtomNoTrustData props', JSON.stringify(props, null, 2));
  const {
    context: {
      address,
      chainId,
      account: { atom_id },
    },
  } = props;
  const hexChainId = chainId.split(':')[1];
  const links = Object.values(VENDORS).map((vendor) => {
    const { getAccountAtomNoTrustData } = vendor;
    if (!getAccountAtomNoTrustData) return null;
    const { url } = getAccountAtomNoTrustData(atom_id, hexChainId);
    return <Link href={url}>{vendor.name}</Link>;
  });
  return (
    <Box>
      <Text>Rate this account on:</Text>
      {links}
      <Button name="account_renderOnTransaction">Back</Button>
    </Box>
  );
};

export const accountAtomTrustData = (props) => {
  console.log('accountAtomTrustData props', JSON.stringify(props, null, 2));
  const {
    context: { tripleId, chainId },
  } = props;
  const hexChainId = chainId.split(':')[1];
  const links = Object.values(VENDORS).map((vendor) => {
    const { getAccountAtomTrustData } = vendor;
    if (!getAccountAtomTrustData) return null;
    const { url } = getAccountAtomTrustData(tripleId, hexChainId);
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

export const rate = {
  accountAtomNoTrustData,
  accountAtomTrustData,
};

export const cta = {
  rate,
};
