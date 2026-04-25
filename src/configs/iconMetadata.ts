import { ICON_LIBRARY, type IconName } from './iconLibrary.config';

/** Human-readable label from an icon id (e.g. stickyNote → Sticky note). */
export function formatIconChoiceTitle(id: string): string {
  return id
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

const OVERRIDES: Partial<Record<IconName, string>> = {
  play: 'Start, trigger, or “go” steps in a flow.',
  settings: 'Configuration, knobs, or adjustable behavior.',
  branch: 'Decisions, alternate paths, and merge points.',
  success: 'Completion, acceptance, or positive outcomes.',
  note: 'Short notes and lightweight annotations.',
  typography: 'Body text, labels, and reading content.',
  input: 'Forms, inputs, and human data entry.',
  database: 'Storage, records, and persistence layers.',
  document: 'Files, exports, and written deliverables.',
  subprocess: 'Nested or reusable process chunks.',
  connector: 'Links, off-page references, and junctions.',
  rectangle: 'Generic steps, boxes, and containers.',
  roundedRectangle: 'Cards, panels, and softer containers.',
  circle: 'States, hubs, and focal points.',
  ellipse: 'Scopes, lanes, and wide emphasis areas.',
  diamond: 'Decisions and gateways (classic diamond).',
  triangle: 'Warnings, priorities, and directional cues.',
  hexagon: 'Services, APIs, and infrastructure nodes.',
  line: 'Separators, guides, and simple connectors.',
  arrow: 'Direction, handoff, and movement on the canvas.',
  frame: 'Grouping, regions, and swimlane-style areas.',
  title: 'Large titles and hero lines.',
  heading: 'Section headings and hierarchy.',
  paragraph: 'Paragraphs and longer explanations.',
  label: 'Short labels and field names.',
  caption: 'Captions, hints, and secondary lines.',
  callout: 'Callouts, highlights, and attention grabs.',
  stickyNote: 'Sticky-style memos and quick ideas.',
  comment: 'Discussion threads and review notes.',
  warning: 'Risks, blockers, and caution states.',
  info: 'Informational callouts and tips.',
  checklist: 'Tasks, todos, and checklists.',
  icon: 'Generic symbol placeholder.',
  architecture: 'System structure and components.',
  journey: 'User paths and experience flows.',
  organization: 'Teams, roles, and hierarchies.',
  pipeline: 'Data movement and ETL-style flows.',
  persona: 'Users, actors, and stakeholders.',
  home: 'Home, landing, or root context.',
  mail: 'Email, messages, and inbox-style steps.',
  phone: 'Calls, SMS, or telephony touchpoints.',
  cloud: 'Cloud services, hosted runtimes, and SaaS.',
  server: 'Servers, hosts, and compute instances.',
  api: 'HTTP APIs, integrations, and contracts.',
  lock: 'Security, encryption, and locked states.',
  key: 'Credentials, secrets, and access tokens.',
  shield: 'Protection, compliance, and trust boundaries.',
  chartBar: 'Bar charts, metrics, and KPIs.',
  chartPie: 'Distribution, proportions, and pie-style metrics.',
  report: 'Reports, dashboards, and analytics outputs.',
  users: 'Groups, teams, and multi-user contexts.',
  user: 'Individual people and user accounts.',
  building: 'Companies, offices, and physical sites.',
  mapPin: 'Locations, geography, and place markers.',
  clock: 'Time, schedules, and deadlines.',
  calendar: 'Dates, planning, and milestones.',
  bolt: 'Speed, energy, and fast paths.',
  flame: 'Hot paths, incidents, or trending items.',
  heart: 'Favorites, likes, and care signals.',
  star: 'Highlights, ratings, and featured items.',
  bookmark: 'Saved items, references, and bookmarks.',
  link: 'URLs, deep links, and references.',
  photo: 'Images, galleries, and raster media.',
  video: 'Video playback and recordings.',
  camera: 'Capture, screenshots, and imaging.',
  search: 'Search, discovery, and lookup.',
  bell: 'Notifications, alerts, and subscriptions.',
  inbox: 'Inbound queues and triage.',
  send: 'Outbound delivery and dispatch.',
  rocket: 'Launches, releases, and go-live moments.',
  coin: 'Payments, money, and pricing.',
  creditCard: 'Billing, cards, and checkout.',
  truck: 'Shipping, logistics, and fulfillment.',
  package: 'Artifacts, bundles, and deliverables.',
  world: 'Global scope, regions, and locales.',
  wifi: 'Connectivity, networks, and online state.',
  deviceDesktop: 'Desktop apps and workstations.',
  deviceMobile: 'Mobile apps and handheld devices.',
  code: 'Source code, snippets, and engineering.',
  terminal: 'CLIs, shells, and operator consoles.',
  clipboardList: 'Lists, audits, and structured checklists.',
  notebook: 'Docs, journals, and longer writeups.',
  pencil: 'Editing, authoring, and drafts.',
  trash: 'Deletion, cleanup, and archival.',
  refresh: 'Reload, sync, and retry cycles.',
  download: 'Downloads, imports, and ingress.',
  upload: 'Uploads, exports, and egress.',
  share: 'Sharing, collaboration, and links out.',
  eye: 'Visibility, previews, and read-only views.',
  tools: 'Tooling, utilities, and maintenance.',
  hammer: 'Builds, fixes, and construction work.',
  bulb: 'Ideas, experiments, and innovation.',
  flag: 'Milestones, markers, and goals.',
  target: 'Objectives, OKRs, and aim states.',
  questionMark: 'Questions, unknowns, and help.',
  filter: 'Filtering, segmentation, and narrowing.',
  adjustments: 'Settings, tuning, and preferences.',
  layoutGrid: 'Layouts, grids, and structured canvases.',
  folders: 'Collections, directories, and bundles.',
  folder: 'A single folder or grouped assets.',
  file: 'Generic files and attachments.',
  receipt: 'Receipts, proofs, and confirmations.',
  badge: 'Badges, labels, and small status chips.',
  pin: 'Pins, anchors, and pinned items.',
};

export function getIconChoiceDescription(id: IconName): string {
  return (
    OVERRIDES[id] ??
    'Visual symbol for diagrams, flows, and canvas annotations.'
  );
}

export function listIconNames(): IconName[] {
  return Object.keys(ICON_LIBRARY).sort() as IconName[];
}
