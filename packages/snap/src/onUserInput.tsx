import { OnUserInputHandler } from '@metamask/snaps-sdk';
import { rate } from './cta';
import { renderOnTransaction } from './account';
import { Identity } from './types';

const components = {
  account: {
    renderOnTransaction,
  },
  rate,
};

export type OnUserInputProps = {
  event: {
    name: string;
  };
  context: Identity;
  id: string;
};

export const onUserInput: OnUserInputHandler = async (
  props: OnUserInputProps,
) => {
  console.group('onUserInput');
  if (!props.event.name) return;
  console.log('props', JSON.stringify(props, null, 2));
  const [type, method] = props.event.name.split('_');
  console.log('type', type);
  console.log('method', method);
  const renderFn = components[type]?.[method];
  console.log('renderFn', renderFn);
  const params = { ...props.context, method };
  console.log('params', JSON.stringify(params, null, 2));
  console.groupEnd();
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id: props.id,
      ui: renderFn(params),
    },
  });
};
