import i18n from '../i18n/i18next'

export const getDefaultTemplates = () => {
    const t = (key) => i18n.t(key)

    const header = `# {{title}}\n{{date}}\n\n`
    const item = `_${t('templates.item_placeholder')}_`

    return [
        {
            filename: 'journal.md',
            content: header +
                `## ${t('templates.journal_mood')}\n${item}\n\n` +
                `## ${t('templates.journal_gratitude')}\n- ${item}\n\n` +
                `## ${t('templates.journal_highlight')}\n${item}\n\n` +
                `## ${t('templates.journal_reflection')}\n${item}\n\n` +
                `## ${t('templates.journal_tomorrow')}\n- [ ] ${item}\n`
        },
        {
            filename: 'checklist.md',
            content: header +
                `## ${t('templates.checklist_urgent')}\n- [ ] ${item}\n\n` +
                `## ${t('templates.checklist_week')}\n- [ ] ${item}\n\n` +
                `## ${t('templates.checklist_someday')}\n- [ ] ${item}\n`
        },
        {
            filename: 'meeting.md',
            content: header +
                `## ${t('templates.meeting_attendees')}\n- ${item}\n\n` +
                `## ${t('templates.meeting_objective')}\n${item}\n\n` +
                `## ${t('templates.meeting_agenda')}\n1. ${item}\n\n` +
                `## ${t('templates.meeting_notes')}\n${item}\n\n` +
                `## ${t('templates.meeting_decisions')}\n- ${item}\n\n` +
                `## ${t('templates.meeting_next_steps')}\n- [ ] ${item}\n`
        },
        {
            filename: 'ideas.md',
            content: header +
                `## ${t('templates.ideas_main')}\n${item}\n\n` +
                `## ${t('templates.ideas_pros')}\n- ${item}\n\n` +
                `## ${t('templates.ideas_cons')}\n- ${item}\n\n` +
                `## ${t('templates.ideas_next_steps')}\n- [ ] ${item}\n`
        },
        {
            filename: 'goals.md',
            content: header +
                `## ${t('templates.goals_objective')}\n${item}\n\n` +
                `## ${t('templates.goals_why')}\n${item}\n\n` +
                `## ${t('templates.goals_steps')}\n- [ ] ${item}\n- [ ] ${item}\n\n` +
                `## ${t('templates.goals_deadline')}\n${item}\n`
        }
    ]
}
