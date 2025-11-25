import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import BaseDiamond from './BaseDiamond';

describe('BaseDiamond', () => {
  it('renders the base diamond svg container', () => {
    render(<BaseDiamond onFirst={false} onSecond={false} onThird={false} />);

    const svg = screen.getByTestId('base-diamond');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'Bases empty');
  });

  it('does not render any runners when all bases are empty', () => {
    render(<BaseDiamond onFirst={false} onSecond={false} onThird={false} />);

    expect(screen.queryByTestId('base-runner-first')).not.toBeInTheDocument();
    expect(screen.queryByTestId('base-runner-second')).not.toBeInTheDocument();
    expect(screen.queryByTestId('base-runner-third')).not.toBeInTheDocument();
  });

  it('renders a runner only on first base when onFirst is true', () => {
    render(<BaseDiamond onFirst onSecond={false} onThird={false} />);

    expect(screen.getByTestId('base-runner-first')).toBeInTheDocument();
    expect(screen.queryByTestId('base-runner-second')).not.toBeInTheDocument();
    expect(screen.queryByTestId('base-runner-third')).not.toBeInTheDocument();

    expect(screen.getByTestId('base-diamond')).toHaveAttribute(
      'aria-label',
      'Runners on first',
    );
  });

  it('renders a runner only on second base when onSecond is true', () => {
    render(<BaseDiamond onFirst={false} onSecond onThird={false} />);

    expect(screen.getByTestId('base-runner-second')).toBeInTheDocument();
    expect(screen.queryByTestId('base-runner-first')).not.toBeInTheDocument();
    expect(screen.queryByTestId('base-runner-third')).not.toBeInTheDocument();

    expect(screen.getByTestId('base-diamond')).toHaveAttribute(
      'aria-label',
      'Runners on second',
    );
  });

  it('renders a runner only on third base when onThird is true', () => {
    render(<BaseDiamond onFirst={false} onSecond={false} onThird />);

    expect(screen.getByTestId('base-runner-third')).toBeInTheDocument();
    expect(screen.queryByTestId('base-runner-first')).not.toBeInTheDocument();
    expect(screen.queryByTestId('base-runner-second')).not.toBeInTheDocument();

    expect(screen.getByTestId('base-diamond')).toHaveAttribute(
      'aria-label',
      'Runners on third',
    );
  });

  it('renders runners on all bases when all flags are true', () => {
    render(<BaseDiamond onFirst onSecond onThird />);

    expect(screen.getByTestId('base-runner-first')).toBeInTheDocument();
    expect(screen.getByTestId('base-runner-second')).toBeInTheDocument();
    expect(screen.getByTestId('base-runner-third')).toBeInTheDocument();

    expect(screen.getByTestId('base-diamond')).toHaveAttribute(
      'aria-label',
      'Runners on first and second and third',
    );
  });

  it('renders runners on second and third with correct aria-label order', () => {
    render(<BaseDiamond onFirst={false} onSecond onThird />);

    expect(screen.queryByTestId('base-runner-first')).not.toBeInTheDocument();
    expect(screen.getByTestId('base-runner-second')).toBeInTheDocument();
    expect(screen.getByTestId('base-runner-third')).toBeInTheDocument();

    expect(screen.getByTestId('base-diamond')).toHaveAttribute(
      'aria-label',
      'Runners on second and third',
    );
  });
});