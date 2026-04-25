import type { IconName } from './iconLibrary.config';

export interface TemplateLibraryItem {
  id: string;
  label: string;
  description: string;
  iconName: IconName;
}

export const TEMPLATE_LIBRARY: TemplateLibraryItem[] = [
  {
    id: 'flowchart-template',
    label: 'Flowchart',
    description: 'Classic process map with branching logic.',
    iconName: 'branch',
  },
  {
    id: 'decision-flow-template',
    label: 'Decision Flow',
    description: 'Decision-centric journey with yes/no outcomes.',
    iconName: 'branch',
  },
  {
    id: 'system-design-template',
    label: 'System Architecture',
    description: 'Services, storage, and supporting notes.',
    iconName: 'architecture',
  },
  {
    id: 'user-journey-template',
    label: 'User Journey',
    description: 'Experience map with stages and annotations.',
    iconName: 'journey',
  },
  {
    id: 'org-chart-template',
    label: 'Org Chart',
    description: 'Hierarchy layout for teams and reporting lines.',
    iconName: 'organization',
  },
  {
    id: 'data-pipeline-template',
    label: 'Data Pipeline',
    description: 'Source-to-destination processing pipeline.',
    iconName: 'pipeline',
  },
];
