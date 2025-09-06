import { OnUserInputHandler } from '@metamask/snaps-sdk';
import { rate } from './cta';
import { renderOnTransaction } from './account';
import { AccountProps } from './types';

type ComponentKey = 'account' | 'rate';
const components = {
  account: {
    renderOnTransaction,
  },
  rate,
};

export type OnUserInputProps = {
  event: {
    name: `${string}:${string}`;
  };
  context: AccountProps;
  id: string;
};

export const onUserInput: OnUserInputHandler = async (props: OnUserInputProps) => {
  if (!props.event.name) return;
  // console.log('props', JSON.stringify(props, null, 2));
  const [type, method] = props.event.name.split('_');
  const renderFn = components[type as ComponentKey][method];
  const params = { ...props.context, method };
  if (!renderFn) return;
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id: props.id,
      ui: renderFn(params),
    },
  });
};
