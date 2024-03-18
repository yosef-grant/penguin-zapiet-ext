import {
  Spinner,
  TextBlock,
  View,
  Icon,
} from '@shopify/ui-extensions-react/checkout';
import { SkeletonImage } from '@shopify/ui-extensions/checkout';
import React from 'react';

const BlockLoader = ({ message, failureStatus }) => {
  console.log('heres the failure status: ', failureStatus);
  return (
    <View position={'relative'}>
      <SkeletonImage blockSize={50} inlineSize={'fill'} aspectRatio={2} />
      <View
        position={{
          type: 'absolute',
          inlineStart: `${50}%`,
          blockStart: `${50}%`,
        }}
        translate={{ block: `${-50}%`, inline: `${-50}%` }}
        minBlockSize={'fill'}
        minInlineSize={'fill'}
        inlineAlignment={'center'}
        blockAlignment={'center'}
      >
        <View
          maxBlockSize={75}
          maxInlineSize={75}
          padding={['none', 'none', 'tight', 'none']}
        >
          {!failureStatus ? (
            <Spinner size="fill" accessibilityLabel={message} />
          ) : (
            <Icon source="warningFill" size="fill" />
          )}
        </View>
        <View inlineAlignment={'center'} maxInlineSize={`${65}%`}>
          <TextBlock inlineAlignment={"center"} size="medium">{message}</TextBlock>
        </View>
      </View>
    </View>
  );
};

export default BlockLoader;
