import { screen } from '@testing-library/react';

import { StorageUsageSummary } from '@components/settings/StorageUsageSummary';

import { renderWithProviders } from '../../testUtils';

describe('StorageUsageSummary', () => {
  it('renders usage copy and diagram count', () => {
    renderWithProviders(
      <StorageUsageSummary
        summary={{ diagramCount: 3, usedBytes: 2048, usedKilobytes: '2.00 KB' }}
      />,
    );

    const root = screen.getByTestId('storage-usage-summary');
    expect(root).toHaveTextContent('2.00 KB');
    expect(root).toHaveTextContent('unlimited');
    expect(root).toHaveTextContent('3 saved diagrams');
    expect(root).toHaveTextContent('2,048');
  });

  it('shows quota progress when the browser reports storage quota', async () => {
    const estimate = vi.fn().mockResolvedValue({ usage: 1000, quota: 10_000 });

    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { estimate },
    });

    renderWithProviders(
      <StorageUsageSummary
        summary={{ diagramCount: 1, usedBytes: 500, usedKilobytes: '0.49 KB' }}
      />,
    );

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '5',
    );

    Reflect.deleteProperty(navigator, 'storage');
  });
});
