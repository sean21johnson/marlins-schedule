import React, { useMemo } from 'react';
import styled from 'styled-components';

import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

import { FaRegCalendarAlt } from 'react-icons/fa';

interface DateControlProps {
  selectedDate: string;
  onChangeDate: (next: string) => void;
}

const Wrapper = styled.div`
  display: inline-block;
`;

const DateButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 0.95rem;
  color: #111827;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  transition: background-color 0.15s ease, box-shadow 0.15s ease,
    transform 0.05s ease;
  &:hover {
    background-color: #f9fafb;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12);
  }
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.16);
  }
  &:focus-visible {
    outline: 2px solid #0ea5e9;
    outline-offset: 2px;
  }
  @media (max-width: 639px) {
    width: 100%;
    justify-content: center;
  }
`;

const DateText = styled.span`
  white-space: nowrap;
`;

const CalendarIconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;

function parseISODate(value: string): Date | null {
  if (!value) return null;

  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month= String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

interface CustomInputProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string;
  onClick?: () => void;
}

const CustomInput = React.forwardRef<HTMLButtonElement, CustomInputProps>(
  ({ value, onClick, ...rest }, ref) => (
    <DateButton type="button" onClick={onClick} ref={ref} aria-label={value ? `Selected date ${value}. Activate to change date.` : 'Select schedule date'}
    aria-haspopup="dialog" {...rest}>
      <DateText>{value || 'Select date'}</DateText>
      <CalendarIconWrapper aria-hidden="true">
        <FaRegCalendarAlt />
      </CalendarIconWrapper>
    </DateButton>
  )
);

CustomInput.displayName = 'CustomDateInput';

const DateControl: React.FC<DateControlProps> = ({
  selectedDate,
  onChangeDate,
}) => {
  const selected = useMemo(() => parseISODate(selectedDate), [selectedDate]);

  return (
    <Wrapper>
      <DatePicker
        selected={selected}
        onChange={(date: Date | null) => {
          if (!date) return;
          onChangeDate(formatISODate(date));
        }}
        dateFormat="MMM d, yyyy"
        customInput={<CustomInput />}
        popperPlacement="bottom"
      />
    </Wrapper>
  );
};

export default DateControl;