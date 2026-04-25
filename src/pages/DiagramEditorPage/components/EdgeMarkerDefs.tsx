export function EdgeMarkerDefs() {
  return (
    <svg
      width="0"
      height="0"
      className="absolute overflow-hidden"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <marker
          id="flowcraft-marker-circle-start"
          markerWidth="10"
          markerHeight="10"
          refX="3"
          refY="5"
          orient="auto-start-reverse"
        >
          <circle cx="5" cy="5" r="3.5" fill="context-stroke" />
        </marker>
        <marker
          id="flowcraft-marker-circle-end"
          markerWidth="10"
          markerHeight="10"
          refX="7"
          refY="5"
          orient="auto"
        >
          <circle cx="5" cy="5" r="3.5" fill="context-stroke" />
        </marker>
        <marker
          id="flowcraft-marker-diamond-start"
          markerWidth="12"
          markerHeight="12"
          refX="3"
          refY="6"
          orient="auto-start-reverse"
        >
          <path d="M6 1 L11 6 L6 11 L1 6 Z" fill="context-stroke" />
        </marker>
        <marker
          id="flowcraft-marker-diamond-end"
          markerWidth="12"
          markerHeight="12"
          refX="9"
          refY="6"
          orient="auto"
        >
          <path d="M6 1 L11 6 L6 11 L1 6 Z" fill="context-stroke" />
        </marker>
      </defs>
    </svg>
  );
}
