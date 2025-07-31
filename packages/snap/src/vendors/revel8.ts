export const REVEL8 = {
  name: 'Revel8',
  getNoAccountAtomInfo: (address: string, chainId: string) => {
    console.log('getNoAccountAtomInfo', address, chainId);
    return {
      url: `https://localhost:3000/redirect/complete_address_trustworthy_triple?address=${address}&chain_id=${chainId}`,
    };
  },
};
