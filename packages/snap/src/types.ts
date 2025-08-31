export type Atom = {
  term_id: string;
  type: string;
  label: string;
  image: null;
  data: string;
  emoji: string;
  followers: any[];
  as_subject_triples: any[];
};

export type Account = {
  id: string;
  label: string;
  image?: string;
  nickname?: string;
  atom_id: string;
};

export type Triple = {
  id: string;
  vault_id: string;
  counter_vault_id: string;
  subject: {
    emoji: string;
    label: string;
    image: string;
    id: string;
  };
  predicate: {
    emoji: string;
    label: string;
    image: string;
    id: string;
  };
  object: {
    emoji: string;
    label: string;
    image: string;
    id: string;
  };
};

export type Vendor = {
  name: string;
  getNoAccountAtomData?: (
    address: string,
    chainId: string,
  ) => {
    url: string;
  };
  getAccountAtomNoTrustData?: (
    account: any,
    chainId: string,
  ) => {
    url: string;
  };
  getAccountAtomTrustData?: (
    tripleId: string,
    chainId?: string,
  ) => {
    stakeTripleUrl: string;
  };
};

export type TripleWithPositions = {
  term_id: string;
  subject_id: string;
  predicate_id: string;
  object_id: string;
  creator_id: string;
  counter_term_id: string;
  term: {
    vaults: {
      term_id: string;
      market_cap: string;
      position_count: number;
      curve_id: string;
    }[];
  };
  counter_term: {
    vaults: {
      term_id: string;
      market_cap: string;
      position_count: number;
      curve_id: string;
    }[];
  };
  triple_term: {
    term_id: string;
    counter_term_id: string;
    total_market_cap: string;
    total_position_count: string;
  };
  triple_vault: {
    term_id: string;
    counter_term_id: string;
    curve_id: string;
    position_count: string;
    market_cap: string;
  };
  positions_aggregate: {
    aggregate: {
      count: number;
      sum: { shares: number };
      avg: { shares: number };
    };
  };
  counter_positions_aggregate: {
    aggregate: {
      count: number;
      sum: { shares: number };
      avg: { shares: number };
    };
  };
  positions: {
    term_id: string;
    counter_term_id: string;
    curve_id: string;
    position_count: string;
    market_cap: string;
  }[];
  counter_positions: {
    term_id: string;
    counter_term_id: string;
    curve_id: string;
    position_count: string;
    market_cap: string;
  }[];
};

export type TripleQueryResponse = {
  triples: TripleWithPositions[];
  chainlink_prices: { usd: number }[];
};
