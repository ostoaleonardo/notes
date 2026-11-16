import { parseReadMarkdown, renderReadHtml } from '../../shared/markdown-dom-render-html'
import { createReadCache, resolveReadContext } from '../read-resolution'

const NOTES = {
    Alpha: { path: 'a.md', title: 'Alpha', anchor: '', text: 'Alpha body with [[Beta]]' },
    Beta: { path: 'b.md', title: 'Beta', anchor: '', text: 'Beta body with ![[Gamma]]' },
    Gamma: { path: 'c.md', title: 'Gamma', anchor: '', text: 'Gamma body with ![[Delta]]' },
    Delta: { path: 'd.md', title: 'Delta', anchor: '', text: 'Delta body' },
    Loop: { path: 'loop.md', title: 'Loop', anchor: '', text: 'Loop calls ![[Loop]]' }
}

const buildServices = () => ({
    resolveLinks: jest.fn(async (targets) => Object.fromEntries(targets.map((target) => [
        target,
        NOTES[target]
            ? { path: NOTES[target].path, target, anchor: '' }
            : { path: null, target, anchor: '' }
    ]))),
    resolveMedia: jest.fn(async (names) => Object.fromEntries(names.map((name) => (
        [name, name === 'pic.png' ? 'data:pic' : null]
    )))),
    loadEmbeds: jest.fn(async (targets) => Object.fromEntries(targets.map((target) => (
        [target, NOTES[target] ? { ...NOTES[target] } : null]
    ))))
})

const render = async (text, services = buildServices()) => {
    const parsed = parseReadMarkdown(text)
    const context = await resolveReadContext(parsed, services, createReadCache())

    return { html: renderReadHtml(parsed, context), services }
}

describe('read resolution of embeds', () => {
    test('renders a media embed with the resolved url', async () => {
        const { html } = await render('![[pic.png]]')

        expect(html).toContain('<img src="data:pic" alt="pic.png">')
    })

    test('keeps the width of a sized image', async () => {
        const { html } = await render('![[pic.png|200]]')

        expect(html).toContain('width="200"')
    })

    test('falls back to a file link when the media has no url', async () => {
        const { html } = await render('![[other.png]]')

        expect(html).toContain('class="file-link"')
    })

    test('renders an embedded note with its title and open link', async () => {
        const { html } = await render('![[Delta]]')

        expect(html).toContain('<span>Delta</span>')
        expect(html).toContain('href="wikilink://d.md"')
        expect(html).toContain('Delta body')
    })

    test('resolves the links inside an embedded note', async () => {
        const { html } = await render('![[Alpha]]')

        expect(html).toContain('href="wikilink://b.md" class="wiki-link">Beta</a>')
    })

    test('stops embedding after the maximum depth', async () => {
        const { html } = await render('![[Beta]]')

        expect(html).toContain('Beta body')
        expect(html).toContain('Gamma body')
        expect(html).not.toContain('Delta body')
        expect(html).toContain('href="wikilink://d.md" class="wiki-link">Delta</a>')
    })

    test('renders a note that embeds itself only once', async () => {
        const { html } = await render('![[Loop]]')

        expect(html.match(/Loop calls/g)).toHaveLength(1)
    })

    test('falls back to a wiki link for a note that cannot be loaded', async () => {
        const { html } = await render('![[Missing]]')

        expect(html).toContain('class="wiki-link-broken"')
    })

    test('renders an inline embed inside a sentence', async () => {
        const { html } = await render('see ![[Delta]] here')

        expect(html).toContain('Delta body')
        expect(html).toContain('see')
    })

    test('asks each service once per distinct name', async () => {
        const { services } = await render('![[pic.png]] ![[pic.png]] ![[Delta]] ![[Delta]]')

        expect(services.resolveMedia).toHaveBeenCalledTimes(1)
        expect(services.loadEmbeds).toHaveBeenCalledTimes(1)
    })

    test('ignores embeds inside code', async () => {
        const { html, services } = await render('`![[Delta]]`\n\n```\n![[pic.png]]\n```')

        expect(html).not.toContain('Delta body')
        expect(services.loadEmbeds).not.toHaveBeenCalled()
        expect(services.resolveMedia).not.toHaveBeenCalled()
    })
})

describe('read resolution of local images', () => {
    const buildLocalServices = () => ({
        ...buildServices(),
        resolveLocalUrls: jest.fn(async (urls) => Object.fromEntries(urls.map((url) => [url, `data:${url}`])))
    })

    test('swaps a local markdown image for its resolved data url', async () => {
        const { html, services } = await render('![a](file:///a.png)', buildLocalServices())

        expect(html).toContain('src="data:file:///a.png"')
        expect(services.resolveLocalUrls).toHaveBeenCalledWith(['file:///a.png'])
    })

    test('swaps the sources inside raw html', async () => {
        const { html } = await render('<img src="content://a/b.png">\n', buildLocalServices())

        expect(html).toContain('src="data:content://a/b.png"')
    })

    test('leaves remote images alone and does not ask for them', async () => {
        const { html, services } = await render('![a](https://x.com/a.png)', buildLocalServices())

        expect(html).toContain('src="https://x.com/a.png"')
        expect(services.resolveLocalUrls).not.toHaveBeenCalled()
    })

    test('resolves local images inside embedded notes', async () => {
        const services = buildLocalServices()
        services.loadEmbeds = jest.fn(async () => ({
            Delta: { path: 'd.md', title: 'Delta', anchor: '', text: '![i](file:///inner.png)' }
        }))

        const { html } = await render('![[Delta]]', services)

        expect(html).toContain('src="data:file:///inner.png"')
    })
})

describe('read resolution of local links', () => {
    test('keeps local file links blocked', async () => {
        const { html } = await render('[doc](file:///a.pdf)', {
            ...buildServices(),
            resolveLocalUrls: jest.fn(async () => ({}))
        })

        expect(html).not.toContain('<a')
    })
})
