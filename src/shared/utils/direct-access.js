import { repositoryEngine } from '@/shared/utils/repository-engine'

export const hasDirectAccess = () => repositoryEngine.hasDirectAccess()

export const requestDirectAccess = () => repositoryEngine.requestDirectAccess()

export const shouldPromptDirectAccess = ({ granted, dismissed, noteCount, minNotes }) => (
    !granted && !dismissed && noteCount >= minNotes
)
