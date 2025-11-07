import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ValueUnitPairManager } from '../value-unit-pair-manager';

describe('ValueUnitPairManager', () => {
  const mockOnChange = jest.fn();
  const defaultValue = [{ valor: '', unidad: '' }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial value', () => {
    render(
      <ValueUnitPairManager
        value={defaultValue}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Especificaciones Técnicas')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ej: 1K, 100, 5V')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ej: Ω, µF, V')).toBeInTheDocument();
  });

  it('displays warning when no valid pairs exist', () => {
    render(
      <ValueUnitPairManager
        value={defaultValue}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Debe agregar al menos una especificación técnica completa')).toBeInTheDocument();
  });

  it('displays empty state when no pairs exist', () => {
    render(
      <ValueUnitPairManager
        value={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('No hay especificaciones agregadas. Haga clic en "Agregar" para añadir.')).toBeInTheDocument();
  });

  it('adds new pair when Agregar button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ValueUnitPairManager
        value={defaultValue}
        onChange={mockOnChange}
      />
    );

    const addButton = screen.getByText('Agregar');
    await user.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      { valor: '', unidad: '' },
      { valor: '', unidad: '' }
    ]);
  });

  it('removes pair when remove button is clicked', async () => {
    const user = userEvent.setup();
    const twoPairs = [
      { valor: '1K', unidad: 'Ω' },
      { valor: '100', unidad: 'V' }
    ];

    render(
      <ValueUnitPairManager
        value={twoPairs}
        onChange={mockOnChange}
      />
    );

    const removeButtons = screen.getAllByRole('button').filter(button =>
      button.querySelector('svg') && button.getAttribute('aria-label')?.includes('X')
    );
    await user.click(removeButtons[0]);

    expect(mockOnChange).toHaveBeenCalledWith([
      { valor: '100', unidad: 'V' }
    ]);
  });

  it('updates pair values when inputs change', async () => {
    const user = userEvent.setup();

    render(
      <ValueUnitPairManager
        value={defaultValue}
        onChange={mockOnChange}
      />
    );

    const valorInput = screen.getByPlaceholderText('ej: 1K, 100, 5V');
    const unidadInput = screen.getByPlaceholderText('ej: Ω, µF, V');

    await user.type(valorInput, '1K');
    await user.type(unidadInput, 'Ω');

    expect(mockOnChange).toHaveBeenCalledWith([
      { valor: '1K', unidad: 'Ω' }
    ]);
  });

  it('shows validation messages for incomplete pairs', async () => {
    const user = userEvent.setup();
    const incompletePairs = [
      { valor: '1K', unidad: '' }, // Missing unidad
      { valor: '', unidad: 'Ω' }, // Missing valor
      { valor: '100', unidad: 'V' } // Complete
    ];

    render(
      <ValueUnitPairManager
        value={incompletePairs}
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('El valor es requerido')).toBeInTheDocument();
      expect(screen.getByText('La unidad es requerida')).toBeInTheDocument();
    });
  });

  it('displays preview for valid pairs', () => {
    const validPairs = [
      { valor: '1K', unidad: 'Ω' },
      { valor: '100', unidad: 'nF' }
    ];

    render(
      <ValueUnitPairManager
        value={validPairs}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Vista previa:')).toBeInTheDocument();
    expect(screen.getByText('1K Ω')).toBeInTheDocument();
    expect(screen.getByText('100 nF')).toBeInTheDocument();
  });

  it('displays summary for valid pairs', () => {
    const validPairs = [
      { valor: '1K', unidad: 'Ω' },
      { valor: '100', unidad: 'nF' }
    ];

    render(
      <ValueUnitPairManager
        value={validPairs}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Resumen:')).toBeInTheDocument();
    expect(screen.getByText('1K Ω')).toBeInTheDocument();
    expect(screen.getByText('100 nF')).toBeInTheDocument();
  });

  it('shows suggested units when categoria is provided', async () => {
    const user = userEvent.setup();
    const validPairs = [{ valor: '1K', unidad: 'Ω' }];

    render(
      <ValueUnitPairManager
        value={validPairs}
        onChange={mockOnChange}
        categoria="RESISTENCIA"
      />
    );

    const unidadInput = screen.getByPlaceholderText('ej: Ω, µF, V');
    await user.click(unidadInput);

    await waitFor(() => {
      expect(screen.getByText('Sugerencias:')).toBeInTheDocument();
      expect(screen.getByText('Ω')).toBeInTheDocument();
      expect(screen.getByText('kΩ')).toBeInTheDocument();
      expect(screen.getByText('MΩ')).toBeInTheDocument();
      expect(screen.getByText('W')).toBeInTheDocument();
    });
  });

  it('shows common units when no categoria is provided', async () => {
    const user = userEvent.setup();
    const validPairs = [{ valor: '1K', unidad: 'Ω' }];

    render(
      <ValueUnitPairManager
        value={validPairs}
        onChange={mockOnChange}
      />
    );

    const unidadInput = screen.getByPlaceholderText('ej: Ω, µF, V');
    await user.click(unidadInput);

    await waitFor(() => {
      expect(screen.getByText('Sugerencias:')).toBeInTheDocument();
      expect(screen.getByText('V')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('W')).toBeInTheDocument();
      expect(screen.getByText('Hz')).toBeInTheDocument();
    });
  });

  it('applies suggested unit when clicked', async () => {
    const user = userEvent.setup();
    const validPairs = [{ valor: '1K', unidad: 'Ω' }];

    render(
      <ValueUnitPairManager
        value={validPairs}
        onChange={mockOnChange}
        categoria="RESISTENCIA"
      />
    );

    const unidadInput = screen.getByPlaceholderText('ej: Ω, µF, V');
    await user.clear(unidadInput);
    await user.click(unidadInput);

    await waitFor(() => {
      const kWButton = screen.getByText('kΩ');
      user.click(kWButton);
    });

    expect(mockOnChange).toHaveBeenCalledWith([
      { valor: '1K', unidad: 'kΩ' }
    ]);
  });

  it('highlights focused pair', async () => {
    const user = userEvent.setup();
    const twoPairs = [
      { valor: '1K', unidad: 'Ω' },
      { valor: '100', unidad: 'V' }
    ];

    render(
      <ValueUnitPairManager
        value={twoPairs}
        onChange={mockOnChange}
      />
    );

    const firstValorInput = screen.getAllByPlaceholderText('ej: 1K, 100, 5V')[0];
    await user.click(firstValorInput);

    // Check that the first pair has focus styling
    const firstPair = firstValorInput.closest('.border-orange-300');
    expect(firstPair).toBeInTheDocument();
  });

  it('highlights invalid pairs with error styling', () => {
    const invalidPairs = [
      { valor: '', unidad: 'Ω' }, // Invalid - missing valor
      { valor: '100', unidad: 'V' } // Valid
    ];

    render(
      <ValueUnitPairManager
        value={invalidPairs}
        onChange={mockOnChange}
      />
    );

    const valorInputs = screen.getAllByPlaceholderText('ej: 1K, 100, 5V');
    const firstPair = valorInputs[0].closest('.border-red-200');
    expect(firstPair).toBeInTheDocument();
  });

  it('disables all inputs when disabled prop is true', () => {
    render(
      <ValueUnitPairManager
        value={defaultValue}
        onChange={mockOnChange}
        disabled={true}
      />
    );

    const addButton = screen.getByText('Agregar');
    expect(addButton).toBeDisabled();

    const valorInput = screen.getByPlaceholderText('ej: 1K, 100, 5V');
    expect(valorInput).toBeDisabled();

    const unidadInput = screen.getByPlaceholderText('ej: Ω, µF, V');
    expect(unidadInput).toBeDisabled();
  });

  it('hides warning message when valid pairs exist', () => {
    const validPairs = [{ valor: '1K', unidad: 'Ω' }];

    render(
      <ValueUnitPairManager
        value={validPairs}
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByText('Debe agregar al menos una especificación técnica completa')).not.toBeInTheDocument();
  });

  it('focuses new pair after adding', async () => {
    const user = userEvent.setup();

    render(
      <ValueUnitPairManager
        value={defaultValue}
        onChange={mockOnChange}
      />
    );

    const addButton = screen.getByText('Agregar');
    await user.click(addButton);

    // The last pair should be focused (the newly added one)
    const valorInputs = screen.getAllByPlaceholderText('ej: 1K, 100, 5V');
    const lastInput = valorInputs[valorInputs.length - 1];
    const focusedPair = lastInput.closest('.border-orange-300');
    expect(focusedPair).toBeInTheDocument();
  });

  it('maintains correct order when removing pairs', async () => {
    const user = userEvent.setup();
    const threePairs = [
      { valor: '1K', unidad: 'Ω' },
      { valor: '100', unidad: 'nF' },
      { valor: '5V', unidad: 'V' }
    ];

    render(
      <ValueUnitPairManager
        value={threePairs}
        onChange={mockOnChange}
      />
    );

    const removeButtons = screen.getAllByRole('button').filter(button =>
      button.querySelector('svg') && button.getAttribute('aria-label')?.includes('X')
    );

    // Remove the middle pair
    await user.click(removeButtons[1]);

    expect(mockOnChange).toHaveBeenCalledWith([
      { valor: '1K', unidad: 'Ω' },
      { valor: '5V', unidad: 'V' }
    ]);
  });
});