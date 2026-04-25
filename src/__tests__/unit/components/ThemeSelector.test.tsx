import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeSelector } from '@components/settings/ThemeSelector';

import { renderWithProviders } from '../../testUtils';

describe('ThemeSelector', () => {
  it('shows light as the active default option', () => {
    renderWithProviders(<ThemeSelector value="light" onChange={vi.fn()} />);

    expect(screen.getByTestId('theme-option-light')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('theme-option-dark')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByTestId('theme-option-system')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('lets the user pick dark or system', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithProviders(<ThemeSelector value="light" onChange={onChange} />);

    await user.click(screen.getByTestId('theme-option-dark'));
    expect(onChange).toHaveBeenCalledWith('dark');

    await user.click(screen.getByTestId('theme-option-system'));
    expect(onChange).toHaveBeenCalledWith('system');
  });
});
