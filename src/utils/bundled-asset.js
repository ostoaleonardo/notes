import { Asset } from 'expo-asset'
import { File } from 'expo-file-system'

import { BUNDLED_KEY_PREFIX } from '@/constants/bundled-content'
import { FILE_URI_SCHEMES } from '@/constants/file-uri-schemes'

export const parseBundledKey = (key) => {
    const [kind, ...segments] = key.replace(BUNDLED_KEY_PREFIX, '').split('/')

    return { kind, folder: segments.slice(0, -1), filename: segments.at(-1) }
}

const fetchServed = (asset) => fetch(asset.uri.replaceAll(' ', '%20'))

const isServed = (asset) => asset.uri.startsWith(FILE_URI_SCHEMES.HTTP)

const downloadLocal = async (asset) => {
    await asset.downloadAsync()

    return new File(asset.localUri)
}

export const readBundledText = async (module) => {
    const asset = Asset.fromModule(module)

    return isServed(asset) ? (await fetchServed(asset)).text() : (await downloadLocal(asset)).text()
}

export const readBundledBytes = async (module) => {
    const asset = Asset.fromModule(module)

    return isServed(asset)
        ? new Uint8Array(await (await fetchServed(asset)).arrayBuffer())
        : (await downloadLocal(asset)).bytes()
}
