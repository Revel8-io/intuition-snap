import { OnUserInputHandler } from '@metamask/snaps-sdk';
import { rate } from './cta';
import { renderOnTransaction } from './account';
import { AccountProps, AccountType } from './types';

const components = {
  account: {
    renderOnTransaction,
  },
  rate,
};

export type OnUserInputProps = {
  event: {
    name: `${string}_${string}`;
  };
  context: AccountProps;
  id: string;
};

export const onUserInput: OnUserInputHandler = async (args) => {
  const { event, context, id } = args;
  if (!event.name || !event.name.includes('_')) {
    return;
  }

  const [type, method] = event.name.split('_');
  if (!method) return;

  const accountContext = context as AccountProps;

  // Type narrowing: handle each component type separately
  if (type === 'account') {
    const accountComponents = components.account;
    if (method === 'renderOnTransaction') {
      const ui = accountComponents.renderOnTransaction(accountContext);
      await snap.request({
        method: 'snap_updateInterface',
        params: { id, ui },
      });
    }
  } else if (type === 'rate') {
    const rateComponents = components.rate;
    const renderFn = rateComponents[method as keyof typeof rateComponents];
    if (renderFn) {
      const params = { ...accountContext, method: method as AccountType };
      const ui = renderFn(params);
      await snap.request({
        method: 'snap_updateInterface',
        params: { id, ui },
      });
    }
  }
};
