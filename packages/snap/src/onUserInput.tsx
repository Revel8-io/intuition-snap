import { OnUserInputHandler } from '@metamask/snaps-sdk';
import { NavigationContext } from './onTransaction';
import { rate } from './cta';
import { AccountComponents as account } from './account';

const components = {
  account,
  rate,
};

type OnUserInputProps = {
  event: {
    name: string;
  };
  context: NavigationContext;
  id: string;
};



export const onUserInput: OnUserInputHandler = async (
  props: OnUserInputProps,
) => {
  if (!props.event.name) return;
  console.log('onUserInput props', JSON.stringify(props, null, 2));
  const [type, method] = props.event.name.split('_');
  const renderFn = components[type]?.[method];

  const params = { ...props, context: props.context };
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id: props.id,
      ui: renderFn(params),
    },
  });
};
