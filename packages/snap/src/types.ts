import { ChainId } from '@metamask/snaps-sdk';

export type Account = {
  id: string;
  label: string;
  image?: string;
  nickname?: string;
  term_id: string;
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

// AccountType enum
export enum AccountType {
  NoAtom = 'NoAtom',
  AtomWithoutTrustTriple = 'AtomWithoutTrustTriple',
  AtomWithTrustTriple = 'AtomWithTrustTriple',
}

// Discriminated union types for proper AccountProps typing
export type AccountProps =
  | {
      accountType: AccountType.NoAtom;
      chainId: ChainId;
      address: string;
      account: Account;
      triple: null;
      nickname: string | null;
      isContract: boolean;
      transactionOrigin?: string;
    }
  | {
      accountType: AccountType.AtomWithoutTrustTriple;
      chainId: ChainId;
      address: string;
      account: Account;
      triple: null;
      nickname: string | null;
      isContract: boolean;
      transactionOrigin?: string;
    }
  | {
      accountType: AccountType.AtomWithTrustTriple;
      chainId: ChainId;
      address: string;
      account: Account;
      triple: TripleWithPositions;
      nickname: string | null;
      isContract: boolean;
      transactionOrigin?: string;
    };

// Helper type to extract props for a specific account type
export type PropsForAccountType<T extends AccountType> = Extract<
  AccountProps,
  { accountType: T }
>;
