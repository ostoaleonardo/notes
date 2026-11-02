import fs from 'fs'
import path from 'path'

const ICON_DIRS = ['src/icons', 'src/ui/icons']
const SOURCE_PATTERN = /require\('\.\/xml\/([^']+)'\)/

const getSources = (dir) => fs.readdirSync(dir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => {
        const match = fs.readFileSync(path.join(dir, file), 'utf8').match(SOURCE_PATTERN)

        return match && { dir, file, xml: match[1] }
    })
    .filter(Boolean)

const sources = ICON_DIRS.flatMap(getSources)

describe('icon compose sources', () => {
    test('finds icons with a source', () => {
        expect(sources.length).toBeGreaterThan(0)
    })

    test.each(sources.map((source) => [source.file, source]))(
        '%s points to an existing xml with a path',
        (_, { dir, xml }) => {
            const file = path.join(dir, 'xml', xml)

            expect(fs.existsSync(file)).toBe(true)
            expect(fs.readFileSync(file, 'utf8')).toContain('android:pathData')
        }
    )

    test.each(ICON_DIRS)('%s has no xml without an icon using it', (dir) => {
        const used = sources.filter((source) => source.dir === dir).map((source) => source.xml)
        const files = fs.existsSync(path.join(dir, 'xml')) ? fs.readdirSync(path.join(dir, 'xml')) : []

        expect(files.filter((file) => !used.includes(file))).toEqual([])
    })
})
