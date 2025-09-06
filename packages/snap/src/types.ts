import { ChainId } from '@metamask/snaps-sdk';

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

export type Identity = {
  chainId: ChainId;
  isContract: boolean;
  accountType: string;
  address: string;
  account: Account | null;
  triple: TripleWithPositions | null;
  nickname: string | null;
  initialUI?: any;
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

// AccountType enum
export enum AccountType {
  NoAccount = 'NoAccount',
  AccountWithoutAtom = 'AccountWithoutAtom',
  AccountWithoutTrustData = 'AccountWithoutTrustData',
  AccountWithTrustData = 'AccountWithTrustData',
}

// Discriminated union types for proper AccountProps typing
export type AccountProps =
  | {
      accountType: AccountType.NoAccount;
      chainId: ChainId;
      address: string;
      account: null;
      triple: null;
      nickname: null;
      isContract: boolean;
    }
  | {
      accountType: AccountType.AccountWithoutAtom;
      chainId: ChainId;
      address: string;
      account: Account;
      triple: null;
      nickname: string | null;
      isContract: boolean;
    }
  | {
      accountType: AccountType.AccountWithoutTrustData;
      chainId: ChainId;
      address: string;
      account: Account;
      triple: null;
      nickname: string | null;
      isContract: boolean;
    }
  | {
      accountType: AccountType.AccountWithTrustData;
      chainId: ChainId;
      address: string;
      account: Account;
      triple: TripleWithPositions;
      nickname: string | null;
      isContract: boolean;
    };

// Helper type to extract props for a specific account type
export type PropsForAccountType<T extends AccountType> = Extract<
  AccountProps,
  { accountType: T }
>;
