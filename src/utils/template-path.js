import { TEMPLATE_FOLDER_KEY_PREFIX } from '@/constants/tabs'
import { DRAWER_ITEM_TYPES } from '@/constants/drawer-views'

const SEPARATOR = '/'

export const joinTemplatePath = (dir, name) => (dir ? dir + SEPARATOR + name : name)

export const splitTemplatePath = (path) => {
    const index = path.lastIndexOf(SEPARATOR)

    return index < 0
        ? { dir: '', base: path }
        : { dir: path.slice(0, index), base: path.slice(index + 1) }
}

const byName = (a, b) => a.localeCompare(b)

export const flattenTemplateTree = (templates, folders, collapsedFolders, dir = '', depth = 0) => {
    const own = templates
        .filter((template) => template.folder === dir)
        .sort((a, b) => byName(a.name, b.name))
        .map((template) => ({ type: DRAWER_ITEM_TYPES.TEMPLATE, id: 'template:' + template.filename, template, depth }))

    const subfolders = folders
        .filter((path) => splitTemplatePath(path).dir === dir)
        .sort(byName)
        .flatMap((path) => {
            const isCollapsed = collapsedFolders.has(TEMPLATE_FOLDER_KEY_PREFIX + path)
            const row = {
                type: DRAWER_ITEM_TYPES.FOLDER,
                id: TEMPLATE_FOLDER_KEY_PREFIX + path,
                path,
                name: splitTemplatePath(path).base,
                depth,
                isCollapsed
            }

            return isCollapsed
                ? [row]
                : [row, ...flattenTemplateTree(templates, folders, collapsedFolders, path, depth + 1)]
        })

    return [...own, ...subfolders]
}
