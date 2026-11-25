import RepositoryFs from 'repository-fs'

import { REPOSITORY_ENGINE_METHODS } from '@/shared/constants/repository-engine'

const bind = (name) => ({
    enumerable: true,
    get: () => (typeof RepositoryFs[name] === 'function' ? (...args) => RepositoryFs[name](...args) : undefined)
})

export const repositoryEngine = Object.defineProperties(
    {},
    Object.fromEntries(REPOSITORY_ENGINE_METHODS.map((name) => [name, bind(name)]))
)
