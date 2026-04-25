import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateDiagramCard } from '@pages/DashboardPage/components/CreateDiagramCard';

describe('CreateDiagramCard', () => {
  it('submits the entered diagram name', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(<CreateDiagramCard onCreate={onCreate} />);

    await user.clear(screen.getByTestId('create-diagram-input'));
    await user.type(screen.getByTestId('create-diagram-input'), 'Roadmap');
    await user.click(screen.getByTestId('create-diagram-button'));

    expect(onCreate).toHaveBeenCalledWith('Roadmap');
  });

  it('submits undefined when the name is left blank so the service can default', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();

    render(<CreateDiagramCard onCreate={onCreate} />);

    await user.clear(screen.getByTestId('create-diagram-input'));
    await user.click(screen.getByTestId('create-diagram-button'));

    expect(onCreate).toHaveBeenCalledWith(undefined);
  });
});
