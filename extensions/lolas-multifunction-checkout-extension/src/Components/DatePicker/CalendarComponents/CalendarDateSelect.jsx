import { Grid, Text, View } from '@shopify/ui-extensions-react/checkout';
import { addDays, addYears, format, getDay, isAfter, isBefore } from 'date-fns';
import React, { useState } from 'react';
import CalendarDateSelectedBtn from './CalendarDateSelectedBtn.jsx';
import CalendarDateUnselectedBtn from './CalendarDateUnselectedBtn.jsx';

const days = Array.apply(null, Array(6)).map(() => {});

const CalendarDateSelect = ({
  selected,
  dateFormat,
  minDate,
  setSelectedDate,
  today,
  blackoutDates,
}) => {
  const isDateDisabled = (date) => {
    if (
      isBefore(new Date(date), new Date(minDate)) ||
      isAfter(new Date(date), addYears(new Date(), 1))
    ) {
      return true;
    } else {
      return blackoutDates.includes(date) ||
        blackoutDates.includes(getDay(new Date(date)) + 1)
        ? true
        : false;
    }
  };

  return (
    <Grid
      columns={['fill', 'fill', 'fill', 'fill', 'fill', 'fill']}
      rows={['auto', 'auto']}
      padding={['base', 'none', 'base', 'none']}
    >
      {days.map((day, i) => (
        <View
          inlineAlignment={'center'}
          blockAlignment={'center'}
          minBlockSize={30}
          key={i}
        >
          <Text
            emphasis={
              (!selected &&
                format(addDays(today, i), dateFormat) === minDate) ||
              selected === format(addDays(today, i), dateFormat)
                ? 'bold'
                : ''
            }
          >
            {format(addDays(today, i), 'EEE').toString()}
          </Text>
        </View>
      ))}
      {days.map((day, i) => (
        <View
          key={i}
          inlineAlignment={'center'}
          blockAlignment={'center'}
          minBlockSize={30}
          minInlineSize={50}
          padding={['tight', 'none', 'none', 'none']}
          inlineSize={'fill'}
        >
          {(!selected &&
            format(new Date(addDays(today, i)), dateFormat) === minDate) ||
          (selected &&
            selected === format(new Date(addDays(today, i)), dateFormat)) ? (
            <CalendarDateSelectedBtn
              isDateDisabled={isDateDisabled}
              setSelectedDate={setSelectedDate}
              today={today}
              index={i}
              dateFormat={dateFormat}
            />
          ) : (
            <CalendarDateUnselectedBtn
              isDateDisabled={isDateDisabled}
              setSelectedDate={setSelectedDate}
              today={today}
              index={i}
              dateFormat={dateFormat}
            />
          )}
        </View>
      ))}
    </Grid>
  );
};

export default CalendarDateSelect;
