export const getAccountQuery = `
query Account($address: String!) {
  account(id: $address) {
    atom {
      id
      label
      image
type
      followers: asObject(where: {subjectId: {_eq: 11}, predicateId: {_eq: 3}}) {
        id
        label
        vault {
          positionCount
        }
      }
      asSubject(
        where: {vault: {positionCount: {_gt: 0}}}
        order_by: {vault: {positionCount: desc}}
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
          positionCount
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
      followers: asObject(where: {subjectId: {_eq: 11}, predicateId: {_eq: 3}}) {
        id
        label
        vault {
          positionCount
        }
      }
      asSubject(
        where: {vault: {positionCount: {_gt: 0}}}
        order_by: {vault: {positionCount: desc}}
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
          positionCount
        }
      }

  }
}`;

export const getClaimsFromFollowingQuery = `
query ClaimsFromFollowingAboutSubject($address: String!, $subjectId: numeric!) {
  claims_from_following(
    args: { address: $address }
    where: { subjectId: { _eq: $subjectId } }
  ) {
    shares
    counterShares
    triple {
      id
      vaultId
      counterVaultId
      label
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
      counterVault {
        id
        positionCount
        totalShares
        currentSharePrice
        myPosition: positions(
          limit: 1
          where: { accountId: { _eq: $address } }
        ) {
          shares
          accountId
        }
      }
      vault {
        id
        positionCount
        totalShares
        currentSharePrice
        myPosition: positions(
          limit: 1
          where: { accountId: { _eq: $address } }
        ) {
          shares
          accountId
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
