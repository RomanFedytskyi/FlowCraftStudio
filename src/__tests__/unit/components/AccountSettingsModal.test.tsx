import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AccountSettingsModal } from '@components/settings/AccountSettingsModal';

import { accountSettingsStorageService } from '@services/settings/accountSettingsStorage.service';

import { renderWithProviders } from '../../testUtils';

describe('AccountSettingsModal', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders app info and theme options', async () => {
    renderWithProviders(<AccountSettingsModal open onClose={vi.fn()} />);

    expect(screen.getByTestId('account-settings-modal')).toBeInTheDocument();
    expect(screen.getByText('FlowCraft Studio')).toBeInTheDocument();
    expect(screen.getByTestId('theme-option-light')).toBeInTheDocument();
    expect(screen.getByTestId('storage-usage-summary')).toBeInTheDocument();
  });

  it('clears local data after confirmation', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const clearSpy = vi.spyOn(
      accountSettingsStorageService,
      'clearAllLocalData',
    );

    renderWithProviders(<AccountSettingsModal open onClose={vi.fn()} />);
    await user.click(screen.getByTestId('clear-local-data-button'));

    await waitFor(() => {
      expect(clearSpy).toHaveBeenCalled();
    });

    confirmSpy.mockRestore();
    clearSpy.mockRestore();
  });
});
