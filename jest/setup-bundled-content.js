jest.mock('@/shared/constants/bundled-context', () => ({
    BUNDLED_CONTENT: Object.assign(() => 1, { keys: () => [] })
}))
