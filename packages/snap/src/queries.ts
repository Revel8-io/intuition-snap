import axios from 'axios';
import { chainConfig, getChainConfigByChainId } from './config';

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
query TripleWithPositionAggregates($subjectId: numeric!, $predicateId: numeric!, $objectId: numeric!) {
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
  query GetTriplesWithHighestStake($subjectId: numeric!, $predicateId: numeric!) {
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

// ABI for Chainlink Price Feed (only the function we need)
const PRICE_FEED_ABI = [
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export const getExchangeRate = async (chainId: number): Promise<number> => {
  const chainConfig = getChainConfigByChainId(chainId);
  if (!chainConfig) {
    throw new Error(
      `Chain config not found for chainId: ${chainId} (${typeof chainId})`,
    );
  }
  try {
    // Encode the function call data for latestRoundData()
    // Function signature: latestRoundData() -> 0xfeaf968c
    const data = '0xfeaf968c';

    // Make the eth_call to the Chainlink price feed
    const result = (await ethereum.request({
      method: 'eth_call',
      params: [
        {
          to: chainConfig.chainlinkContractAddress,
          data: data,
        },
        'latest',
      ],
    })) as string;

    // Decode the result
    // latestRoundData returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    // We need the 'answer' field which is the second return value (32 bytes offset)

    if (!result || result === '0x') {
      throw new Error('No data returned from price feed');
    }

    // Remove '0x' prefix and parse the hex result
    const hexResult = result.slice(2);

    // Skip first 32 bytes (roundId) and get next 32 bytes (answer)
    const answerHex = hexResult.slice(64, 128); // bytes 32-64 contain the answer

    // Convert hex to BigInt (signed 256-bit integer)
    const answerBigInt = BigInt('0x' + answerHex);

    // Chainlink ETH/USD price feeds return prices with 8 decimals
    // So we need to divide by 10^8 to get the actual price
    const price = Number(answerBigInt) / 100000000; // 10^8

    console.log('ETH/USD price from Chainlink:', price);
    return price;
  } catch (error) {
    console.error('Error fetching exchange rate from Chainlink:', error);
    // Return a fallback price or rethrow the error
    throw new Error(`Failed to fetch exchange rate: ${error.message}`);
  }
};
