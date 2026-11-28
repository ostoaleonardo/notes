import RepositoryEngine from 'repository-engine'

import { REPOSITORY_ENGINE_METHODS } from '@/shared/constants/repository-engine'

const bind = (name) => ({
    enumerable: true,
    get: () => (typeof RepositoryEngine[name] === 'function' ? (...args) => RepositoryEngine[name](...args) : undefined)
})

export const repositoryEngine = Object.defineProperties(
    {},
    Object.fromEntries(REPOSITORY_ENGINE_METHODS.map((name) => [name, bind(name)]))
)
