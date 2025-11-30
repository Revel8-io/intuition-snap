import { OnUserInputHandler } from '@metamask/snaps-sdk';
import { AccountProps } from './types';


// currently inert
export type OnUserInputProps = {
  event: {
    name: `${string}_${string}`;
  };
  context: AccountProps;
  id: string;
};

export const onUserInput: OnUserInputHandler = async (args) => {
  // Currently inert
};
