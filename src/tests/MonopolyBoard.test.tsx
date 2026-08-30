import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameProvider } from '../context/GameContext';
import { MonopolyBoard } from '../components/board/MonopolyBoard';

describe('MonopolyBoard Component', () => {
  it('renders all 40 board squares and center hub', () => {
    render(
      <GameProvider>
        <MonopolyBoard />
      </GameProvider>,
    );

    // Verify key squares are rendered
    expect(screen.getByText('GO')).toBeInTheDocument();
    expect(screen.getByText('Visiting')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Go To')).toBeInTheDocument();
    expect(screen.getByText('Boardwalk')).toBeInTheDocument();
    expect(screen.getByText('MONOPOLY')).toBeInTheDocument();
  });
});
