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
  console.group('onUserInput');
  if (!props.event.name) return;
  console.log('props', JSON.stringify(props));
  const [type, method] = props.event.name.split('_');
  console.log('type', type);
  console.log('method', method);
  const renderFn = components[type]?.[method];
  console.log('renderFn', renderFn);
  const params = { ...props, context: props.context, type, method };
  console.log('params', JSON.stringify(params));
  console.groupEnd();
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id: props.id,
      ui: renderFn(params),
    },
  });
};
