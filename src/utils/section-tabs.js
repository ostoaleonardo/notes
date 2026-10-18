export const sectionId = (entityId, sectionKey) => `${entityId}:${sectionKey}`

export const resolveSection = (relations, selection, entityId) => (
    relations.find((section) => (
        section.key === selection.key && selection.id === entityId
    )) || relations[0] || null
)

export const findSectionById = (relations, entityId, id) => (
    relations.find((section) => sectionId(entityId, section.key) === id) || null
)
