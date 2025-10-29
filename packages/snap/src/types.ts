import { ChainId } from '@metamask/snaps-sdk';

export type Account = {
  id: string;
  label: string;
  image?: string;
  nickname?: string;
  atom_id: string;
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
      originData?: GetOriginDataResult | null;
      transactionOrigin?: string;
    }
  | {
      accountType: AccountType.AccountWithoutAtom;
      chainId: ChainId;
      address: string;
      account: Account;
      triple: null;
      nickname: string | null;
      isContract: boolean;
      originData?: GetOriginDataResult | null;
      transactionOrigin?: string;
    }
  | {
      accountType: AccountType.AccountWithoutTrustData;
      chainId: ChainId;
      address: string;
      account: Account;
      triple: null;
      nickname: string | null;
      isContract: boolean;
      originData?: GetOriginDataResult | null;
      transactionOrigin?: string;
    }
  | {
      accountType: AccountType.AccountWithTrustData;
      chainId: ChainId;
      address: string;
      account: Account;
      triple: TripleWithPositions;
      nickname: string | null;
      isContract: boolean;
      originData?: GetOriginDataResult | null;
      transactionOrigin?: string;
    };

// Helper type to extract props for a specific account type
export type PropsForAccountType<T extends AccountType> = Extract<
  AccountProps,
  { accountType: T }
>;

// Origin Atom types
export type OriginAtom = {
  term_id: string;
  type: string;
  label: string;
  image?: string;
  data: string;
  emoji?: string;
  creator_id: string;
};

// Origin Type enum
export enum OriginType {
  NoOrigin = 'NoOrigin',                 // No transaction origin provided
  NoAtom = 'NoAtom',                      // Origin provided but no atom exists
  AtomWithoutTrust = 'AtomWithoutTrust',  // Atom exists but no trust data
  AtomWithTrust = 'AtomWithTrust',        // Atom exists with trust data
}

// Origin data result type
export type GetOriginDataResult = {
  originAtom: OriginAtom | null;
  originTriple: TripleWithPositions | null;
  originNickname: string | null;
};
