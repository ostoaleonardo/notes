jest.mock('@/constants/bundled-context', () => ({
    bundledContent: Object.assign(() => 1, { keys: () => [] })
}))
