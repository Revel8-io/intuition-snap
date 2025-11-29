import {
  Address,
  Box,
  Row,
  Text,
  Value,
  Italic,
} from '@metamask/snaps-sdk/jsx';
import { AccountType, PropsForAccountType, AlternateTrustData } from '../types';
import { stringToDecimal } from '../util';
import { chainConfig } from '../config';
import { Footer } from './Footer';

/**
 * Displays a note when alternate atom format (CAIP vs 0x) has trust data.
 * Helps users understand there may be additional relevant trust information.
 */
const AlternateTrustNote = ({
  alternateTrustData,
  isContract,
}: {
  alternateTrustData: AlternateTrustData;
  isContract: boolean;
}) => {
  if (!alternateTrustData.hasAlternateTrustData) {
    return null;
  }

  // Determine the appropriate note text based on which format is alternate
  const noteText = alternateTrustData.alternateIsCaip
    ? `ℹ️ This address also has trust data as a contract on ${chainConfig.chainName}.`
    : `ℹ️ This address also has trust data as an EOA.`;

  return (
    <Box>
      <Text>
        <Italic>{noteText}</Italic>
      </Text>
      <Text>
        <Italic>View more to investigate.</Italic>
      </Text>
    </Box>
  );
};

/**
 * Account display component for addresses with no atom on Intuition.
 * Shows a message indicating no data exists for this address.
 */
export const NoAtom = (
  params: PropsForAccountType<AccountType.NoAtom>,
) => {
  console.log('😎 NoAtom params', JSON.stringify(params, null, 2));
  const { isContract, alternateTrustData } = params;
  const accountTypeSyntax = isContract ? 'contract' : 'address';

  return (
    <Box>
      <Box>
        <Text>No information about this {accountTypeSyntax} on Intuition, yet!</Text>
        <AlternateTrustNote
          alternateTrustData={alternateTrustData}
          isContract={isContract}
        />
      </Box>
      <Footer {...params} />
    </Box>
  );
};

/**
 * Account display component for addresses with an atom but no trust triple.
 * Shows the atom data and prompts user to create trust attestation.
 */
export const AtomWithoutTrustTriple = (
  params: PropsForAccountType<AccountType.AtomWithoutTrustTriple>,
) => {
  console.log('😎 AtomWithoutTrustTriple params', JSON.stringify(params, null, 2));
  const { account, nickname, isContract, alternateTrustData } = params;

  return (
    <Box>
      <Box>
        {!!nickname && (
          <Row label="Nickname">
            <Value value={`"${nickname}"`} extra="" />
          </Row>
        )}
        <Text>Atom exists for {account?.label || account?.data}, but it has no trust data yet</Text>
        <AlternateTrustNote
          alternateTrustData={alternateTrustData}
          isContract={isContract}
        />
      </Box>
      <Footer {...params} />
    </Box>
  );
};

/**
 * Account display component for addresses with an atom and trust triple.
 * Shows full trust data with support/oppose market caps and position counts.
 */
export const AtomWithTrustTriple = (
  params: PropsForAccountType<AccountType.AtomWithTrustTriple>,
) => {
  console.log('😎 AtomWithTrustTriple params', JSON.stringify(params, null, 2));
  const { address, triple, nickname, isContract, alternateTrustData } = params;
  const {
    counter_term: {
      vaults: [counterVault],
    },
    term: {
      vaults: [vault],
    },
    positions,
    counter_positions,
  } = triple;

  const supportMarketCap = vault?.market_cap || '0';
  const supportMarketCapNative = stringToDecimal(supportMarketCap, 18);
  const opposeMarketCap = counterVault?.market_cap || '0';
  const opposeMarketCapNative = stringToDecimal(opposeMarketCap, 18);

  return (
    <Box>
      <Box>
        <Row label="Address">
          <Address address={address as `0x${string}`} />
        </Row>
        {!!nickname && (
          <Row label="Nickname">
            <Value value={`"${nickname}"`} extra="" />
          </Row>
        )}
        <Row label={`Trustworthy (${positions.length})`}>
          <Value
            value={`${supportMarketCapNative.toFixed(2)} ${chainConfig.currencySymbol}`}
            extra={``}
          />
        </Row>
        <Row label={`Not trustworthy (${counter_positions.length})`}>
          <Value
            value={`${opposeMarketCapNative.toFixed(2)} ${chainConfig.currencySymbol}`}
            extra={``}
          />
        </Row>
        <AlternateTrustNote
          alternateTrustData={alternateTrustData}
          isContract={isContract}
        />
      </Box>
      <Footer {...params} />
    </Box>
  );
};

// Type mapping for account components
export type AccountComponents = {
  [K in AccountType]: (params: PropsForAccountType<K>) => JSX.Element;
};

export const AccountComponents: AccountComponents = {
  [AccountType.NoAtom]: NoAtom,
  [AccountType.AtomWithoutTrustTriple]: AtomWithoutTrustTriple,
  [AccountType.AtomWithTrustTriple]: AtomWithTrustTriple,
};
