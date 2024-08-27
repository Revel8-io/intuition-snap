type Address = `0x${string}`;

export interface AccountResponse {
  account: {
    id: Address;
    image: string | null;
    label: string | null;
    atomId: bigint | null;
  }
  atoms: {
    id: bigint;
    emoji: string | null;
    image: string | null;
    label: string | null;
    type: string;
    creatorId: `0x${string}`;
    blockTimestamp: bigint;
    vault: {
      currentSharePrice: bigint;
      totalShares: bigint;
      positionCount: number;
    };
  }[]
  triples: {
    id: bigint;
    label: string | null;
    blockTimestamp: bigint;
    vault: {
      currentSharePrice: bigint;
      totalShares: bigint;
      positionCount: number;
    };
    counterVault: {
      currentSharePrice: bigint;
      totalShares: bigint;
      positionCount: number;
    };
  }[]
  positions: {
    id: string;
    shares: bigint;
    vault: {
      currentSharePrice: bigint;
      totalShares: bigint;
      positionCount: number;
    };
    atom: {
      id: bigint;
      label: string | null;
      emoji: string | null;
      image: string | null;
    } | null;
    triple: {
      id: bigint;
      label: string | null;
    } | null;
  }[]
  signals: {
    blockTimestamp: bigint;
    delta: bigint;
    relativeStrength: bigint;
    depositId: string | null;
    redemptionId: string | null;
    account: {
      id: `0x${string}`;
      label: string;
      image: string | null;
    } | null;
    atom: {
      id: bigint;
      label: string | null;
      image: string | null;
      emoji: string | null;
    } | null;
    triple: {
      id: bigint;
      label: string | null;
    } | null;
  }[]
  prices: {
    usd: number;
  }
}


export interface AtomResponse {
  atom: {
    id: bigint;
    emoji: string | null;
    image: string | null;
    label: string | null;
    type: string;
    data: string;
    blockTimestamp: bigint;
    account: {
      id: Address;
      label: string | null;
      image: string | null;
    } | null;
    person: {
      name: string | null;
      image: string | null;
      description: string | null;
    } | null;
    thing: {
      name: string | null;
      image: string | null;
      description: string | null;
    } | null;
    organization: {
      name: string | null;
      image: string | null;
      description: string | null;
    } | null;
  }
  tags: {
    id: bigint;
    atom: {
      label: string | null;
      id: bigint;
      emoji: string | null;
      image: string | null;
    };
    vault: {
      currentSharePrice: bigint;
      totalShares: bigint;
      positionCount: number;
    };
    counterVault: {
      currentSharePrice: bigint;
      totalShares: bigint;
      positionCount: number;
    };
  }[]
  triples: {
    id: bigint;
    label: string | null;
    vault: {
      currentSharePrice: bigint;
      totalShares: bigint;
      positionCount: number;
    };
    counterVault: {
      currentSharePrice: bigint;
      totalShares: bigint;
      positionCount: number;
    };
  }[]
  creator: {
    id: `0x${string}`;
    label: string;
    image: string | null;
  }
  vault: {
    id: bigint;
    totalShares: bigint;
    currentSharePrice: bigint;
    positionCount: number;
  }
  positions: {
    id: string;
    vaultId: bigint;
    shares: bigint;
    accountId: `0x${string}`;
    accountType: "Default" | "AtomWallet" | "ProtocolVault" | null;
    accountLabel: string | null;
    accountImage: string | null;
  }[],
  signals: {
    id: string;
    blockTimestamp: bigint;
    atomId: bigint | null;
    delta: bigint;
    relativeStrength: bigint;
    accountId: `0x${string}`;
    accountLabel: string | null;
    accountImage: string | null;
    accountType: "Default" | "AtomWallet" | "ProtocolVault" | null;
  }[],
  prices: {
    usd: number;
  }
}
