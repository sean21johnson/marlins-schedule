/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DateControl from './DateControl';

jest.mock('react-datepicker', () => {
  const React = require('react');

  return function MockDatePicker(props: any) {
    const { customInput, onChange } = props;

    const handleClick = () => {
      const picked = new Date(2024, 0, 15);
      onChange(picked);
    };

    return React.cloneElement(customInput, {
      'data-testid': 'date-control-button',
      onClick: handleClick,
    });
  };
});

describe('DateControl', () => {
  it('renders a button when no date is selected', () => {
    render(<DateControl selectedDate="" onChangeDate={jest.fn()} />);

    const button = screen.getByTestId('date-control-button');
    expect(button).toBeInTheDocument();

    expect(button).toHaveAccessibleName(/select schedule date/i);
    expect(button).toHaveTextContent(/select date/i);
  });

  it('calls onChangeDate with an ISO date string when a date is picked', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<DateControl selectedDate="" onChangeDate={handleChange} />);

    const button = screen.getByTestId('date-control-button');
    await user.click(button);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('2024-01-15');
  });
});