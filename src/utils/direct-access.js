import RepositoryFs from 'repository-fs'

export const hasDirectAccess = () => RepositoryFs.hasDirectAccess()

export const requestDirectAccess = () => RepositoryFs.requestDirectAccess()

export const shouldPromptDirectAccess = ({ granted, dismissed, noteCount, minNotes }) => (
    !granted && !dismissed && noteCount >= minNotes
)
