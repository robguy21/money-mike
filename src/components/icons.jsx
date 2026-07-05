/**
 * Inline SVG icons (replacing @mui/icons-material). They inherit `currentColor`
 * and are decorative — buttons that use them carry their own aria-label.
 */
const baseProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.25,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
};

export function CheckIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M20 6 9 17l-5-5"/>
        </svg>
    );
}

export function TrashIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M3 6h18"/>
            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        </svg>
    );
}

export function PlusIcon(props) {
    return (
        <svg {...baseProps} {...props}>
            <path d="M12 5v14M5 12h14"/>
        </svg>
    );
}
