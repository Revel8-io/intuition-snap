<<<<<<< HEAD
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
  console.log('graphQLQuery data', JSON.stringify(data, null, 2));
  return data;
};

export const checkAccountAtomExistenceQuery = `
query CheckAccountAtomExistence($address: String!) {
  account(id: $address) {
    atom_id
  }
}
`;

export const getAccountQuery = `
query Account($address: String!, $caipAddress: String!) {
  accounts(where: { id: { _in: [$address, $caipAddress] } }, limit: 1) {
=======
export const getAccountQuery = `
query Account($address: String!, $lowerAddress: String!) {
  account(id: $lowerAddress) {
>>>>>>> 0xintuition/main
    id
    label
    image
    atom_id
    atom {
      term_id
      type
<<<<<<< HEAD
      label
      image
      data
      emoji
    }
  }
  chainlink_prices(limit: 1, order_by: { id: desc }) {
    usd
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
=======
      followers: as_object_triples(where: {
        subject_id: {_eq: "0xd355d338262427b95c7cd6badca808a334f930c721dcce6bbcca2a83217dcced"},
        predicate_id: {_eq: "0x8f9b5dc2e7b8bd12f6762c839830672f1d13c08e72b5f09f194cafc153f2df8a"}
      }) {
        triple_vault {
          position_count
        }
      }
      as_subject_triples(
        limit: 20
        where: {triple_vault: {position_count: {_gt: 0}}}
        order_by: {triple_vault: {position_count: desc}}
      ) {
        object {
          label
        }
        predicate {
          term_id
          label
          emoji
        }
        triple_vault {
          position_count
        }
      }
    }
  }
  following_aggregate(args: { address: $address }) {
    aggregate {
      count
    }
  }
}
`;

export const searchAtomsQuery = `
query SearchAtoms($uri: String) {
  atoms(where: { data: { _eq: $uri } }) {
    term_id
    label
    image
    type
    followers: as_object_triples(
      where: {subject_id: {_eq: "0xd355d338262427b95c7cd6badca808a334f930c721dcce6bbcca2a83217dcced"}, predicate_id: {_eq: "0x8f9b5dc2e7b8bd12f6762c839830672f1d13c08e72b5f09f194cafc153f2df8a"}}
    ) {
      triple_vault {
        position_count
      }
    }
    as_subject_triples(
      limit: 20
      where: { triple_vault: { position_count: { _gt: 0 } } }
      order_by: { triple_vault: { position_count: desc } }
    ) {
      object {
        label
      }
      predicate {
        term_id
        label
        emoji
      }
      triple_vault {
        position_count
      }
    }
  }
}
`;

export const getClaimsFromFollowingQuery = `
query ClaimsFromFollowingAboutSubject($address: String!, $subjectId: String!) {
  positions_from_following(
    args: { address: $address }
    where: { term: { triple: { subject_id: { _eq: $subjectId } } } }
  ) {
    shares
    term {
      triple {
        term {
          id
        }
        predicate {
          emoji
          label
          term_id
        }
        object {
          label
        }
      }
    }
  }
}`;
>>>>>>> 0xintuition/main
