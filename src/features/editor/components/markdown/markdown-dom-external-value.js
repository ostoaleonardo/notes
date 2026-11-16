export const shouldApplyExternalValue = ({ value, docValue, lastEmitted, pendingEmitted }) => (
    value !== lastEmitted && value !== docValue && !pendingEmitted.has(value)
)
