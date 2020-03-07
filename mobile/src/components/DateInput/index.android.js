import React, { useState, useMemo } from 'react';
import { DatePickerAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import { Container, DateButton, DateText, Picker } from './styles';

const DateInput = ({ date, onChange }) => {
  const [opened, setOpened] = useState(false);

  const dateFormatted = useMemo(() => {
    format(date, "dd 'de' MMMM 'de' yyyy", { locale: pt });
  }, [date]);

  async function handleOpenPicker() {
    const { action, year, month, day } = await DatePickerAndroid.open({
      mode: 'spinner',
      date,
    });

    if (action === DatePickerAndroid.dateSetAction) {
      const selectedDate = new Date(year, month, day);

      onChange(selectedDate);
    }
  }

  return (
    <Container>
      <DateButton onPress={handleOpenPicker}>
        <Icon name="event" size={20} color="fff" />
        <DateText>{dateFormatted}</DateText>
      </DateButton>
    </Container>
  );
};

export default DateInput;
