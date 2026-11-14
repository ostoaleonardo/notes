import { LanguageDescription, LanguageSupport, StreamLanguage } from '@codemirror/language'

const clike = () => import('@codemirror/legacy-modes/mode/clike')
const javascript = () => import('@codemirror/lang-javascript')

const pack = (importer, exportName, options) => async () => (await importer())[exportName](options)
export const legacySupport = (mode) => new LanguageSupport(StreamLanguage.define(mode))

const legacy = (importer, exportName) => async () => legacySupport((await importer())[exportName])

const LANGUAGE_SOURCES = [
    { name: 'JavaScript', alias: ['js', 'jsx', 'mjs', 'cjs'], load: pack(javascript, 'javascript', { jsx: true }) },
    { name: 'TypeScript', alias: ['ts', 'tsx'], load: pack(javascript, 'javascript', { typescript: true, jsx: true }) },
    { name: 'JSON', alias: ['jsonc', 'json5'], load: pack(() => import('@codemirror/lang-json'), 'json') },
    { name: 'CSS', alias: ['scss'], load: pack(() => import('@codemirror/lang-css'), 'css') },
    { name: 'HTML', alias: ['htm', 'xml', 'svg', 'vue'], load: pack(() => import('@codemirror/lang-html'), 'html') },
    { name: 'Python', alias: ['py'], load: pack(() => import('@codemirror/lang-python'), 'python') },
    { name: 'SQL', alias: ['mysql', 'postgresql', 'sqlite'], load: pack(() => import('@codemirror/lang-sql'), 'sql') },
    { name: 'YAML', alias: ['yml'], load: pack(() => import('@codemirror/lang-yaml'), 'yaml') },
    { name: 'Shell', alias: ['sh', 'bash', 'zsh'], load: legacy(() => import('@codemirror/legacy-modes/mode/shell'), 'shell') },
    { name: 'Java', alias: [], load: legacy(clike, 'java') },
    { name: 'Kotlin', alias: ['kt'], load: legacy(clike, 'kotlin') },
    { name: 'C', alias: ['h'], load: legacy(clike, 'c') },
    { name: 'C++', alias: ['cpp', 'cc', 'hpp'], load: legacy(clike, 'cpp') },
    { name: 'C#', alias: ['cs', 'csharp'], load: legacy(clike, 'csharp') },
    { name: 'Swift', alias: [], load: legacy(() => import('@codemirror/legacy-modes/mode/swift'), 'swift') },
    { name: 'Go', alias: ['golang'], load: legacy(() => import('@codemirror/legacy-modes/mode/go'), 'go') },
    { name: 'Rust', alias: ['rs'], load: legacy(() => import('@codemirror/legacy-modes/mode/rust'), 'rust') },
    { name: 'Ruby', alias: ['rb'], load: legacy(() => import('@codemirror/legacy-modes/mode/ruby'), 'ruby') },
    { name: 'TOML', alias: [], load: legacy(() => import('@codemirror/legacy-modes/mode/toml'), 'toml') },
    { name: 'Diff', alias: ['patch'], load: legacy(() => import('@codemirror/legacy-modes/mode/diff'), 'diff') },
    { name: 'Dockerfile', alias: ['docker'], load: legacy(() => import('@codemirror/legacy-modes/mode/dockerfile'), 'dockerFile') }
]

export const codeLanguages = LANGUAGE_SOURCES.map(({ name, alias, load }) => (
    LanguageDescription.of({ name, alias, load })
))

export const findCodeLanguage = (info) => (
    info ? LanguageDescription.matchLanguageName(codeLanguages, info, true) : null
)

export const getCodeLanguageLabel = (info) => findCodeLanguage(info)?.name ?? info
