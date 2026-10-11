import i18n from '@/i18n/i18next'

import { DEFAULT_TEMPLATE_FILES } from '@/constants/default-templates'

export const getDefaultTemplates = () => {
    const t = (key) => i18n.t(key)

    const header = `# {{title}}\n{{date}}\n\n`
    const item = `_${t('templates.item_placeholder')}_`

    return [
        {
            filename: DEFAULT_TEMPLATE_FILES.JOURNAL,
            content:
                `## ${t('templates.journal.mood')}\n${item}\n\n` +
                `## ${t('templates.journal.gratitude')}\n- ${item}\n\n` +
                `## ${t('templates.journal.highlight')}\n${item}\n\n` +
                `## ${t('templates.journal.reflection')}\n${item}\n\n` +
                `## ${t('templates.journal.tomorrow')}\n- [ ] ${item}\n`
        },
        {
            filename: DEFAULT_TEMPLATE_FILES.CHECKLIST,
            content: header +
                `## ${t('templates.checklist.urgent')}\n- [ ] ${item}\n\n` +
                `## ${t('templates.checklist.week')}\n- [ ] ${item}\n\n` +
                `## ${t('templates.checklist.someday')}\n- [ ] ${item}\n`
        },
        {
            filename: DEFAULT_TEMPLATE_FILES.MEETING,
            content: header +
                `## ${t('templates.meeting.attendees')}\n- ${item}\n\n` +
                `## ${t('templates.meeting.objective')}\n${item}\n\n` +
                `## ${t('templates.meeting.agenda')}\n1. ${item}\n\n` +
                `## ${t('templates.meeting.notes')}\n${item}\n\n` +
                `## ${t('templates.meeting.decisions')}\n- ${item}\n\n` +
                `## ${t('templates.meeting.next_steps')}\n- [ ] ${item}\n`
        },
        {
            filename: DEFAULT_TEMPLATE_FILES.IDEAS,
            content: header +
                `## ${t('templates.ideas.main')}\n${item}\n\n` +
                `## ${t('templates.ideas.pros')}\n- ${item}\n\n` +
                `## ${t('templates.ideas.cons')}\n- ${item}\n\n` +
                `## ${t('templates.ideas.next_steps')}\n- [ ] ${item}\n`
        },
        {
            filename: DEFAULT_TEMPLATE_FILES.GOALS,
            content: header +
                `## ${t('templates.goals.objective')}\n${item}\n\n` +
                `## ${t('templates.goals.why')}\n${item}\n\n` +
                `## ${t('templates.goals.steps')}\n- [ ] ${item}\n- [ ] ${item}\n\n` +
                `## ${t('templates.goals.deadline')}\n${item}\n`
        }
    ]
}
