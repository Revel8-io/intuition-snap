import styled, { useTheme } from 'styled-components';

import { getThemePreference } from '../utils';
import { HeaderButtons } from './Buttons';
import HiveMindLogo from '../assets/logo.svg';
import { Toggle } from './Toggle';

const HeaderWrapper = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2.4rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border?.default};
`;

const Title = styled.p`
  font-size: ${(props) => props.theme.fontSizes.title};
  font-weight: bold;
  margin: 0;
  margin-left: 1.2rem;
  ${({ theme }) => theme.mediaQueries.small} {
    display: none;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const Header = ({
  handleToggleClick,
}: {
  handleToggleClick(): void;
}) => {
  const theme = useTheme();

  return (
    <HeaderWrapper>
      <LogoWrapper>
        <img src={HiveMindLogo} height={36} width={36} alt="Hive Mind Logo" color={theme.colors.icon?.default} />
        <Title>Hive Mind Snap</Title>
      </LogoWrapper>
      <RightContainer>
        <Toggle
          onToggle={handleToggleClick}
          defaultChecked={getThemePreference()}
        />
        <HeaderButtons />
      </RightContainer>
    </HeaderWrapper>
  );
};
