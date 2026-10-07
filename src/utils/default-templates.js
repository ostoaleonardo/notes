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
                `## ${t('templates.journal_mood')}\n${item}\n\n` +
                `## ${t('templates.journal_gratitude')}\n- ${item}\n\n` +
                `## ${t('templates.journal_highlight')}\n${item}\n\n` +
                `## ${t('templates.journal_reflection')}\n${item}\n\n` +
                `## ${t('templates.journal_tomorrow')}\n- [ ] ${item}\n`
        },
        {
            filename: DEFAULT_TEMPLATE_FILES.CHECKLIST,
            content: header +
                `## ${t('templates.checklist_urgent')}\n- [ ] ${item}\n\n` +
                `## ${t('templates.checklist_week')}\n- [ ] ${item}\n\n` +
                `## ${t('templates.checklist_someday')}\n- [ ] ${item}\n`
        },
        {
            filename: DEFAULT_TEMPLATE_FILES.MEETING,
            content: header +
                `## ${t('templates.meeting_attendees')}\n- ${item}\n\n` +
                `## ${t('templates.meeting_objective')}\n${item}\n\n` +
                `## ${t('templates.meeting_agenda')}\n1. ${item}\n\n` +
                `## ${t('templates.meeting_notes')}\n${item}\n\n` +
                `## ${t('templates.meeting_decisions')}\n- ${item}\n\n` +
                `## ${t('templates.meeting_next_steps')}\n- [ ] ${item}\n`
        },
        {
            filename: DEFAULT_TEMPLATE_FILES.IDEAS,
            content: header +
                `## ${t('templates.ideas_main')}\n${item}\n\n` +
                `## ${t('templates.ideas_pros')}\n- ${item}\n\n` +
                `## ${t('templates.ideas_cons')}\n- ${item}\n\n` +
                `## ${t('templates.ideas_next_steps')}\n- [ ] ${item}\n`
        },
        {
            filename: DEFAULT_TEMPLATE_FILES.GOALS,
            content: header +
                `## ${t('templates.goals_objective')}\n${item}\n\n` +
                `## ${t('templates.goals_why')}\n${item}\n\n` +
                `## ${t('templates.goals_steps')}\n- [ ] ${item}\n- [ ] ${item}\n\n` +
                `## ${t('templates.goals_deadline')}\n${item}\n`
        }
    ]
}
