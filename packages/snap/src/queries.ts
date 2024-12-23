export const getAccountQuery = `
query Account($address: String!) {
  account(id: $address) {
    id
    label
    image
    atom {
      id
      type
      followers: as_object_triples(where: {subject_id: {_eq: 11}, predicate_id: {_eq: 3}}) {
        id
        vault {
          position_count
        }
      }
      as_subject_triples(
        where: {vault: {position_count: {_gt: 0}}}
        order_by: {vault: {position_count: desc}}
      ) {
        object {
          label
        }
        predicate {
          id
          label
          emoji
        }
        vault {
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
    id
    label
    image
    type
    followers: as_object_triples(
      where: { subject_id: { _eq: 11 }, predicate_id: { _eq: 3 } }
    ) {
      id
      vault {
        position_count
      }
    }
    as_subject_triples(
      where: { vault: { position_count: { _gt: 0 } } }
      order_by: { vault: { position_count: desc } }
    ) {
      object {
        label
      }
      predicate {
        id
        label
        emoji
      }
      vault {
        position_count
      }
    }
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
