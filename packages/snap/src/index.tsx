import type { OnHomePageHandler } from '@metamask/snaps-sdk';

export const onHomePage: OnHomePageHandler = async () => {
  return {
    content: <div>Welcome to Intuition</div>,
  };
};

export * from './onTransaction';
export * from './onUserInput';
