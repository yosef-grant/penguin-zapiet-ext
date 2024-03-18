import { Button, Text } from '@shopify/ui-extensions-react/checkout';
import { InlineLayout } from '@shopify/ui-extensions/checkout';
import { addDays, format } from 'date-fns';
import React from 'react';

const CalendarDateSelectedBtn = ({
  isDateDisabled,
  setSelectedDate,
  today,
  index,
  dateFormat
}) => {
  return (
    <InlineLayout minInlineSize={70} minBlockSize={50} maxBlockSize={50}>
      <Button
        disabled={isDateDisabled(format(addDays(today, index), dateFormat))}
        onPress={() =>
          setSelectedDate(format(new Date(addDays(today, index)), dateFormat))
        }
      >
        <Text>{format(addDays(today, index), 'd').toString()}</Text>
      </Button>
    </InlineLayout>
  );
};

export default CalendarDateSelectedBtn;


