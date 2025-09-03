export const getAccountQuery = `
query Account($address: String!, $lowerAddress: String!) {
  account(id: $lowerAddress) {
    id
    label
    image
    atom {
      term_id
      type
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
