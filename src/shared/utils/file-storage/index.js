import * as entries from './entries'
import * as notes from './notes'
import * as folders from './folders'
import * as versions from './versions'
import * as json from './json'
import * as snapshot from './snapshot'

export const fileStorage = {
    ...entries,
    ...notes,
    ...folders,
    ...versions,
    ...json,
    ...snapshot
}
