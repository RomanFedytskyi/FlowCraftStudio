import type { DiagramNodeStyle, HelperAnnotationKind } from '../types/diagram';

/** Defaults aligned with annotation visual spec (canvas-first, neutral grays). */
export function getHelperDefaultStyle(
  kind: HelperAnnotationKind,
): DiagramNodeStyle {
  switch (kind) {
    case 'plain-text':
      return {
        fontSize: 16,
        fontWeight: 'normal',
        textAlign: 'left',
        borderWidth: 0,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        backgroundEnabled: false,
        textColor: '#E5E7EB',
      };
    case 'section-title':
      return {
        fontSize: 28,
        fontWeight: 'semibold',
        textAlign: 'left',
        borderWidth: 0,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        backgroundEnabled: false,
        textColor: '#F9FAFB',
        letterSpacing: '-0.02em',
      };
    case 'caption':
      return {
        fontSize: 13,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        borderWidth: 0,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        backgroundEnabled: false,
        textColor: '#6B7280',
      };
    case 'small-label':
      return {
        fontSize: 11,
        fontWeight: 'medium',
        textAlign: 'left',
        borderWidth: 0,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        backgroundEnabled: false,
        textColor: '#9CA3AF',
        textTransform: 'none',
      };
    case 'callout':
      return {
        fontSize: 17,
        fontWeight: 'medium',
        textAlign: 'left',
        borderWidth: 0,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        backgroundEnabled: false,
        textColor: '#E5E7EB',
      };
    default:
      return {
        fontSize: 16,
        fontWeight: 'normal',
        textAlign: 'left',
        borderWidth: 0,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        backgroundEnabled: false,
        textColor: '#E5E7EB',
      };
  }
}
