import {
  InlineLayout,
  Pressable,
  Text,
} from '@shopify/ui-extensions-react/checkout';
import { addDays, format } from 'date-fns';
import React, { useState } from 'react';

const CalendarDateUnselectedBtn = ({isDateDisabled, setSelectedDate, today, index, dateFormat}) => {


    
     const [currentHover, setCurrentHover] = useState(null);
  return (
    <InlineLayout minInlineSize={`${50}%`}>
      <Pressable
        minInlineSize={70}
        minBlockSize={50}
        maxBlockSize={50}
        blockAlignment={'center'}
        inlineAlignment={'center'}
        disabled={isDateDisabled(format(addDays(today, index), dateFormat))}
        onPointerEnter={() => setCurrentHover(index)}
        onPointerLeave={() => setCurrentHover(null)}
        border={currentHover === index ? 'base' : 'none'}
        borderRadius={'base'}
        onPress={() =>
          setSelectedDate(format(new Date(addDays(today, index)), dateFormat))
        }
      >
        <Text>{format(addDays(today, index), 'd').toString()}</Text>
      </Pressable>
    </InlineLayout>
  );
};

export default CalendarDateUnselectedBtn;


