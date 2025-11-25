import React from 'react';
import styled from 'styled-components';

interface SimulateButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

const StyledButton = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background-color: ${({ $active }) => ($active ? '#e0f2fe' : '#ffffff')};
  cursor: pointer;
  font-size: 0.95rem;
  color: #111827;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.05s ease;
  &:hover {
    background-color: ${({ $active }) => ($active ? '#dbeafe' : '#f9fafb')};
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
  &:disabled {
    cursor: default;
    background-color: #e5e7eb;
  }
`;

const SimulateButton: React.FC<SimulateButtonProps> = ({
  active = false,
  children,
  ...rest
}) => {
  return (
    <StyledButton
      type="button"
      $active={active}
      aria-pressed={active}
      data-testid="simulate-button"
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default SimulateButton;