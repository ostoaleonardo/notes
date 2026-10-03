export const RADIUS = {
    outer: 16,
    inner: 8,
    pill: 24,
    segment: 6
}

export const GROUP_CORNERS = {
    first: { left: RADIUS.pill, right: RADIUS.segment },
    middle: { left: RADIUS.segment, right: RADIUS.segment },
    last: { left: RADIUS.segment, right: RADIUS.pill }
}
