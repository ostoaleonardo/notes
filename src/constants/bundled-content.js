export const BUNDLED_WELCOME = {
    en: require('../content/welcome/en.md'),
    es: require('../content/welcome/es.md')
}

export const BUNDLED_TEMPLATES = {
    en: {
        journal: require('../content/templates/en/journal.md'),
        checklist: require('../content/templates/en/checklist.md'),
        meeting: require('../content/templates/en/meeting.md'),
        ideas: require('../content/templates/en/ideas.md'),
        goals: require('../content/templates/en/goals.md')
    },
    es: {
        journal: require('../content/templates/es/journal.md'),
        checklist: require('../content/templates/es/checklist.md'),
        meeting: require('../content/templates/es/meeting.md'),
        ideas: require('../content/templates/es/ideas.md'),
        goals: require('../content/templates/es/goals.md')
    }
}

export const TITLE_LINE_PATTERN = /^#\s+(.+)\n+/
