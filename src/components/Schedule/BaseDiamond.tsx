import React from 'react';
import styled from 'styled-components';

interface BaseDiamondProps {
  onFirst: boolean;
  onSecond: boolean;
  onThird: boolean;
}

const DiamondSvg = styled.svg`
  width: 24px;
  height: 24px;
`;

const BaseDiamond: React.FC<BaseDiamondProps> = ({
  onFirst,
  onSecond,
  onThird,
}) => {
  const label =
  onFirst || onSecond || onThird
    ? `Runners on ${[
        onFirst ? 'first' : null,
        onSecond ? 'second' : null,
        onThird ? 'third' : null,
      ].filter(Boolean).join(' and ')}`
    : 'Bases empty';

  return (
    <DiamondSvg
      viewBox="0 0 24 24"
      role="img"
      aria-label={label}
      focusable="false"
      data-testid="base-diamond"
    >
      <polygon
        points="12,2 22,12 12,22 2,12"
        fill="none"
        stroke="#111827"
        strokeWidth="1"
      />
      {onThird && (
        <circle
          cx="7"
          cy="12"
          r="2"
          fill="#111827"
          data-testid="base-runner-third"
        />
      )}
      {onSecond && (
        <circle
          cx="12"
          cy="7"
          r="2"
          fill="#111827"
          data-testid="base-runner-second"
        />
      )}
      {onFirst && (
        <circle
          cx="17"
          cy="12"
          r="2"
          fill="#111827"
          data-testid="base-runner-first"
        />
      )}
    </DiamondSvg>
  );
};

export default BaseDiamond;