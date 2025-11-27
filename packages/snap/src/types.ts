import { ChainId } from '@metamask/snaps-sdk';

export type Account = {
  id: string;
  data: string;
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
    id: string;
    account_id: string;
    term_id: string;
    curve_id: string;
    account?: {
      id: string;
      label: string;
    };
  }[];
  counter_positions: {
    id: string;
    account_id: string;
    term_id: string;
    curve_id: string;
    account?: {
      id: string;
      label: string;
    };
  }[];
};

// AccountType enum
export enum AccountType {
  NoAtom = 'NoAtom',
  AtomWithoutTrustTriple = 'AtomWithoutTrustTriple',
  AtomWithTrustTriple = 'AtomWithTrustTriple',
}

/** Common props shared across all account states */
type BaseAccountProps = {
  chainId: ChainId;
  /** The destination address of the transaction */
  address: string;
  /** The connected user's wallet address (for checking existing positions) */
  userAddress?: string;
  nickname: string | null;
  isContract: boolean;
  transactionOrigin?: string;
};

// Discriminated union types for proper AccountProps typing
export type AccountProps =
  | (BaseAccountProps & {
      accountType: AccountType.NoAtom;
      account: null;
      triple: null;
    })
  | (BaseAccountProps & {
      accountType: AccountType.AtomWithoutTrustTriple;
      account: Account;
      triple: null;
    })
  | (BaseAccountProps & {
      accountType: AccountType.AtomWithTrustTriple;
      account: Account;
      triple: TripleWithPositions;
    });

// Helper type to extract props for a specific account type
export type PropsForAccountType<T extends AccountType> = Extract<
  AccountProps,
  { accountType: T }
>;
