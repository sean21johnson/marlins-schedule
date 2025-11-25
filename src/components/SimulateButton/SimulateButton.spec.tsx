import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SimulateButton from './SimulateButton';

describe('SimulateButton', () => {
  it('renders with provided label and default inactive state', () => {
    render(<SimulateButton>Simulate Live Game</SimulateButton>);

    const button = screen.getByTestId('simulate-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Simulate Live Game');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('sets aria-pressed to true when active', () => {
    render(<SimulateButton active>End Live Game Simulation</SimulateButton>);

    const button = screen.getByTestId('simulate-button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveTextContent('End Live Game Simulation');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <SimulateButton onClick={handleClick}>
        Simulate Live Game
      </SimulateButton>,
    );

    const button = screen.getByTestId('simulate-button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <SimulateButton onClick={handleClick} disabled>
        Simulate Live Game
      </SimulateButton>,
    );

    const button = screen.getByTestId('simulate-button');
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});