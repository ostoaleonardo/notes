import i18n from '../i18n/i18next'

export const getDefaultTemplates = () => {
    const t = (key) => i18n.t(key)

    const header = `# {{title}}\n{{date}}\n\n`

    return [
        {
            filename: 'journal.md',
            content: header +
                `## ${t('templates.journal_mood')}\n\n\n` +
                `## ${t('templates.journal_gratitude')}\n- \n- \n- \n\n` +
                `## ${t('templates.journal_highlight')}\n\n\n` +
                `## ${t('templates.journal_reflection')}\n\n\n` +
                `## ${t('templates.journal_tomorrow')}\n- [ ] \n- [ ] \n`
        },
        {
            filename: 'checklist.md',
            content: header +
                `## ${t('templates.checklist_urgent')}\n- [ ] \n- [ ] \n\n` +
                `## ${t('templates.checklist_week')}\n- [ ] \n- [ ] \n\n` +
                `## ${t('templates.checklist_someday')}\n- [ ] \n`
        },
        {
            filename: 'meeting.md',
            content: header +
                `## ${t('templates.meeting_attendees')}\n- \n\n` +
                `## ${t('templates.meeting_objective')}\n\n\n` +
                `## ${t('templates.meeting_agenda')}\n1. \n2. \n3. \n\n` +
                `## ${t('templates.meeting_notes')}\n\n\n` +
                `## ${t('templates.meeting_decisions')}\n- \n\n` +
                `## ${t('templates.meeting_next_steps')}\n- [ ] \n`
        }
    ]
}
