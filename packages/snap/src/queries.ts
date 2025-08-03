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
    id
    label
    image
    atom_id
    atom {
      term_id
      type
      label
      image
      data
      emoji
      followers: as_object_triples(
        where: { subject_id: { _eq: 11 }, predicate_id: { _eq: 3 } }
      ) {
        term_id
        term {
          vaults(where: { curve_id: { _eq: "1" } }) {
            position_count
          }
        }
      }
      as_subject_triples(
        where: { term: { vaults: { position_count: { _gt: 0 } } } }
        order_by: { term: { total_market_cap: desc } }
      ) {
        term_id
        term {
          vaults(where: { curve_id: { _eq: "1" } }) {
            position_count
          }
        }
        object {
          label
        }
        predicate {
          term_id
          label
          emoji
        }
      }
    }
  }
  chainlink_prices(limit: 1, order_by: { id: desc }) {
    usd
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
      where: { subject_id: { _eq: 11 }, predicate_id: { _eq: 3 } }
    ) {
      term_id
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          position_count
        }
      }
    }
    as_subject_triples(
      where: { term: { vaults: { position_count: { _gt: 0 } } } }
      order_by: { term: { total_market_cap: desc } }
    ) {
      term_id
      object {
        label
        term_id
      }
      predicate {
        term_id
        label
        emoji
      }
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          position_count
        }
      }
    }
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

export const getClaimsFromFollowingQuery = `
query ClaimsFromFollowingAboutSubject($address: String!, $subjectId: numeric!) {
  claims_from_following(
    args: { address: $address }
    where: { subject_id: { _eq: $subjectId } }
  ) {
    shares
    counter_shares
    triple {
      id
      vault_id
      counter_vault_id
      subject {
        emoji
        label
        image
        id
      }
      predicate {
        emoji
        label
        image
        id
      }
      object {
        emoji
        label
        image
        id
      }
      counter_vault {
        id
        position_count
        total_shares
        current_share_price
        myPosition: positions(
          limit: 1
          where: { account_id: { _eq: $address } }
        ) {
          shares
          account_id
        }
      }
      vault {
        id
        position_count
        total_shares
        current_share_price
        myPosition: positions(
          limit: 1
          where: { account_id: { _eq: $address } }
        ) {
          shares
          account_id
        }
      }
    }
    account {
      id
      label
    }
  }
}
`;

// will take in predicate_id and object_id
// then will look for instances of account being used
// as the subject for the triple and select the triple with the highest
// total market cap
export const getTripleExistsWithPositionAggregatesQuery = `
query TripleExistsWithPositionAggregates($subjectId: numeric!, $predicateId: numeric!, $objectId: numeric!) {
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
