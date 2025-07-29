export const REVEL8 = {
  name: 'Revel8',
  getNoAccountAtomInfo: (account: string, chainId?: string) => {
    return {
      url: `https://localhost:3001/redirect/complete_address_trustworhy_triple?address=${account}&chainId=${chainId}`,
    };
  },
};
