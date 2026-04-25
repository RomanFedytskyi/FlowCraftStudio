import { createBrowserRouter } from 'react-router-dom';

import { DashboardPage } from '@pages/DashboardPage/DashboardPage';
import { DiagramEditorPage } from '@pages/DiagramEditorPage/DiagramEditorPage';

import { AppShell } from '@components/layout/AppShell';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'diagram/:diagramId',
        element: <DiagramEditorPage />,
      },
    ],
  },
]);
