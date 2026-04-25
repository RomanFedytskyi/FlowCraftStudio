import type { IconName } from './iconLibrary.config';
import type { DiagramNodeStyle, DiagramNodeType } from '../types/diagram';

export type BlockLibraryTabId = 'blocks' | 'templates';

export interface BlockLibraryNodeItem {
  id: string;
  kind: 'node';
  tab: BlockLibraryTabId;
  nodeType: DiagramNodeType;
  label: string;
  description: string;
  iconName?: IconName;
  preview: string;
  defaultData?: Partial<{
    label: string;
    subtitle: string;
    icon: IconName;
    value: string | number;
    status: 'default' | 'success' | 'warning' | 'danger';
    badgeLabel: string;
    tags: string[];
    style: DiagramNodeStyle;
  }>;
}

export interface BlockLibraryTemplateItem {
  id: string;
  kind: 'template';
  tab: 'templates';
  templateId: string;
  label: string;
  description: string;
  iconName?: IconName;
  preview: string;
}

export type BlockLibraryItem = BlockLibraryNodeItem | BlockLibraryTemplateItem;

export interface BlockLibraryTab {
  id: BlockLibraryTabId;
  label: string;
  items: BlockLibraryItem[];
}

/**
 * Palette stays minimal: generic blocks you style on the canvas. Dedicated
 * geometry presets (diamond, circle, etc.) are not listed here—configure a
 * block and save it as a diagram or template when you want a reusable shape.
 */
export const BLOCK_LIBRARY_TABS: BlockLibraryTab[] = [
  {
    id: 'blocks',
    label: 'Blocks',
    items: [
      {
        id: 'canvas-block',
        kind: 'node',
        tab: 'blocks',
        nodeType: 'process',
        label: 'Block',
        description:
          'Default canvas block. Set icon, colors, and label in properties.',
        iconName: 'rectangle',
        preview: '▢',
        defaultData: {
          label: 'Block',
          icon: 'settings',
          tags: [],
        },
      },
      {
        id: 'canvas-text',
        kind: 'node',
        tab: 'blocks',
        nodeType: 'text',
        label: 'Text',
        description: 'Readable copy on the diagram. Tune typography in Style.',
        iconName: 'typography',
        preview: 'Aa',
        defaultData: {
          label: '',
          icon: 'typography',
          tags: [],
        },
      },
      {
        id: 'canvas-note',
        kind: 'node',
        tab: 'blocks',
        nodeType: 'sticky-note',
        label: 'Note',
        description: 'Quick memo styling; adjust color on the right.',
        iconName: 'stickyNote',
        preview: 'N',
        defaultData: {
          label: '',
          icon: 'stickyNote',
          tags: [],
        },
      },
      {
        id: 'canvas-input',
        kind: 'node',
        tab: 'blocks',
        nodeType: 'custom-input',
        label: 'Input',
        description: 'Form-like node with label and value.',
        iconName: 'input',
        preview: 'In',
        defaultData: {
          label: 'Label',
          value: 'Value',
          tags: [],
        },
      },
      {
        id: 'canvas-counter',
        kind: 'node',
        tab: 'blocks',
        nodeType: 'counter',
        label: 'Counter',
        description: 'Interactive counter/status value.',
        iconName: 'badge',
        preview: '1',
        defaultData: {
          label: 'Counter',
          value: 0,
          tags: [],
        },
      },
      {
        id: 'canvas-circle',
        kind: 'node',
        tab: 'blocks',
        nodeType: 'circle-compact',
        label: 'Circle',
        description: 'Compact circle with label.',
        iconName: 'circle',
        preview: '◯',
        defaultData: {
          label: 'Circle',
          tags: [],
          style: { width: 160, height: 160 },
        },
      },
      {
        id: 'canvas-svg-shape',
        kind: 'node',
        tab: 'blocks',
        nodeType: 'svg-shape',
        label: 'SVG Shape',
        description: 'SVG shape node with configurable form.',
        iconName: 'layoutGrid',
        preview: 'S',
        defaultData: {
          label: 'Shape',
          tags: [],
          style: { width: 220, height: 140 },
        },
      },
      {
        id: 'canvas-architecture',
        kind: 'node',
        tab: 'blocks',
        nodeType: 'architecture',
        label: 'Architecture',
        description: 'Icon + title + subtitle + status.',
        iconName: 'architecture',
        preview: 'A',
        defaultData: {
          label: 'Service',
          subtitle: 'api.example.com',
          icon: 'world',
          status: 'default',
          tags: [],
          style: { width: 280, height: 160, borderWidth: 2 },
        },
      },
      {
        id: 'canvas-toolbar-node',
        kind: 'node',
        tab: 'blocks',
        nodeType: 'toolbar',
        label: 'Toolbar Node',
        description: 'Shows quick actions on selection.',
        iconName: 'tools',
        preview: 'T',
        defaultData: {
          label: 'Toolbar',
          tags: [],
          style: { width: 260, height: 150 },
        },
      },
    ],
  },
  {
    id: 'templates',
    label: 'Templates',
    items: [
      [
        'flowchart-template',
        'Flowchart',
        'Classic process flow starter.',
        'branch',
        '▦',
      ],
      [
        'decision-flow-template',
        'Decision Flow',
        'Branch-heavy decision model.',
        'branch',
        '◇',
      ],
      [
        'system-design-template',
        'System Architecture',
        'Services and data stores.',
        'architecture',
        '◫',
      ],
      [
        'user-journey-template',
        'User Journey',
        'Experience journey map starter.',
        'journey',
        '◎',
      ],
      [
        'org-chart-template',
        'Org Chart',
        'Hierarchy starter.',
        'organization',
        '⌘',
      ],
      [
        'data-pipeline-template',
        'Data Pipeline',
        'Source-transform-destination starter.',
        'pipeline',
        '⇢',
      ],
    ].map(
      ([templateId, label, description, iconName, preview]) =>
        ({
          id: String(templateId),
          kind: 'template',
          tab: 'templates',
          templateId: String(templateId),
          label,
          description,
          iconName: iconName as IconName,
          preview,
        }) satisfies BlockLibraryTemplateItem,
    ),
  },
];
