import axios from 'axios';
import { chainConfig } from './config';

export const i7nAxios = axios.create({
  baseURL: chainConfig.backendUrl,
});

export const graphQLQuery = async (query: string, variables: any) => {
  const { data } = await i7nAxios.post('', {
    query,
    variables,
  });
  return data;
};

export const getAddressAtomsQuery = `
query AddressAtoms($plainAddress: String!, $caipAddress: String!) {
  # Atoms matching plain address format (for EOAs)
  plainAtoms: atoms(where: {
    _or: [
      { label: { _ilike: $plainAddress } },
      { data: { _ilike: $plainAddress } }
    ]
  }, limit: 1) {
    term_id
    type
    label
    image
    data
    emoji
    creator_id
  }

  # Atoms matching CAIP format (for smart contracts)
  caipAtoms: atoms(where: {
    _or: [
      { label: { _ilike: $caipAddress } },
      { data: { _ilike: $caipAddress } }
    ]
  }, limit: 1) {
    term_id
    type
    label
    image
    data
    emoji
    creator_id
  }
}
`;

// will take in predicate_id and object_id
// then will look for instances of account being used
// as the subject for the triple and select the triple with the highest
// total market cap
export const getTripleWithPositionsDataQuery = `
query TripleWithPositionAggregates($subjectId: String!, $predicateId: String!, $objectId: String!) {
  triples(where: {
    subject_id: { _eq: $subjectId },
    predicate_id: { _eq: $predicateId },
    object_id: { _eq: $objectId }
  }) {
    term_id
    subject_id
    predicate_id
    object_id
    creator_id
    counter_term_id

    # Main vault (support) market data
    term {
      vaults(where: { curve_id: { _eq: "1" } }) {
        term_id
        market_cap
        position_count
        curve_id
      }
    }

    # Counter vault (oppose) market data
    counter_term {
      vaults(where: { curve_id: { _eq: "1" } }) {
        term_id
        market_cap
        position_count
        curve_id
      }
    }

    # Triple-specific aggregated market data
    triple_term {
      term_id
      counter_term_id
      total_market_cap
      total_position_count
    }

    # Detailed triple vault data per curve
    triple_vault {
      term_id
      counter_term_id
      curve_id
      position_count
      market_cap
    }

    positions_aggregate {
      aggregate {
        count
        sum {
          shares
        }
        avg {
          shares
        }
      }
    }

    counter_positions_aggregate {
      aggregate {
        count
        sum {
          shares
        }
        avg {
          shares
        }
      }
    }

    positions(
      order_by: { shares: desc }
      limit: 10
    ) {
      id
      account_id
      term_id
      curve_id
      shares
      account {
        id
        label
      }
    }

    counter_positions(
      order_by: { shares: desc }
      limit: 10
    ) {
      id
      account_id
      term_id
      curve_id
      shares
      account {
        id
        label
      }
    }
  }
  chainlink_prices(limit: 1, order_by: { id: desc }) {
    usd
  }
  backup_chainlink_prices: chainlink_prices(
    limit: 1,
    order_by: { id: desc },
    where: { usd: { _is_null: false } }
  ) {
    usd
  }
}
`;

/**
 * Query to find an atom by URL (for origin trust signals).
 * Searches by label or data field matching the origin URL.
 */
export const getOriginAtomQuery = `
query OriginAtom($originUrl: String!) {
  atoms(where: {
    _or: [
      { label: { _ilike: $originUrl } },
      { data: { _ilike: $originUrl } }
    ]
  }, limit: 1) {
    term_id
    type
    label
    image
    data
    emoji
    creator_id
  }
}
`;

/**
 * Query for origin trust triple data.
 * Simplified version of getTripleWithPositionsDataQuery for origin display.
 */
export const getOriginTrustTripleQuery = `
query OriginTrustTriple($subjectId: String!, $predicateId: String!, $objectId: String!) {
  triples(where: {
    subject_id: { _eq: $subjectId },
    predicate_id: { _eq: $predicateId },
    object_id: { _eq: $objectId }
  }) {
    term_id

    term {
      vaults(where: { curve_id: { _eq: "1" } }) {
        term_id
        market_cap
        position_count
      }
    }

    counter_term {
      vaults(where: { curve_id: { _eq: "1" } }) {
        term_id
        market_cap
        position_count
      }
    }

    positions(order_by: { shares: desc }, limit: 10) {
      id
      shares
    }

    counter_positions(order_by: { shares: desc }, limit: 10) {
      id
      shares
    }
  }
}
`;

export const getListWithHighestStakeQuery = `
  query GetTriplesWithHighestStake($subjectId: String!, $predicateId: String!) {
    triples(
      where: {
        subject_id: { _eq: $subjectId },
        predicate_id: { _eq: $predicateId }
      },
      order_by: { triple_term: { total_market_cap: desc } }
    ) {
      term_id
      subject_id
      predicate_id
      object_id
      creator_id
      counter_term_id

      # Triple-specific aggregated market data (stake information)
      triple_term {
        term_id
        counter_term_id
        total_market_cap
        total_position_count
      }

      # Individual vault data
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          term_id
          market_cap
          position_count
          curve_id
        }
      }

      counter_term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          term_id
          market_cap
          position_count
          curve_id
        }
      }

      # Object information for context
      object {
        label
        image
        data
      }
    }

    chainlink_prices(limit: 1, order_by: { id: desc }) {
      usd
    }
  }
`;
