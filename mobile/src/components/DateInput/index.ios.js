import React, { useState } from 'react';
import { DatePickerIOS } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import { Container, DateButton, DateText, Picker } from './styles';

const DateInput = ({ date }) => {
  const [opened, setOpened] = useState(false);

  const dateFormatted = useMemo(() => {
    format(date, "dd 'de' MMMM 'de' yyyy", { locale: pt });
  }, [date]);

  return (
    <Container>
      <DateButton
        onPress={() => {
          setOpened(!opened);
        }}
      >
        <Icon name="event" size={20} color="fff" />
        <DateText>{dateFormatted}</DateText>
      </DateButton>
      {opened && (
        <Picker>
          <DatePickerIOS
            date={date}
            onDateChange={onChange}
            minimunDate={new Date()}
            minimumInterval={60}
            locale="pt"
            mode="date"
          />
        </Picker>
      )}
    </Container>
  );
};

export default DateInput;
