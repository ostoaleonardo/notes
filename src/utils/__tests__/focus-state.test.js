import { INITIAL_FOCUS_STATE, FOCUS_ACTIONS, focusReducer, validTrail } from '../focus-state'
import { ROOT_ENTITY, buildConnectionModel, makeEntity } from '../connection-model'
import {
    MOCK_CONNECTION_FILES,
    MOCK_CONNECTION_NOTES,
    MOCK_CONNECTION_NOTE_PATHS
} from '../__fixtures__/connections'
import { CONNECTION_TYPES, HISTORY_LIMIT } from '@/constants/connections'

const folder = makeEntity(CONNECTION_TYPES.FOLDER, 'Projects')
const note = makeEntity(CONNECTION_TYPES.NOTE, 'p::Beta.md')

const reduce = (state, ...actions) => actions.reduce(focusReducer, state)

describe('enter an entity', () => {
    test('adds it to the trail and returns to the first page', () => {
        const state = reduce(
            { ...INITIAL_FOCUS_STATE, page: 2 },
            { type: FOCUS_ACTIONS.ENTER, entity: folder }
        )

        expect(state).toEqual({ trail: [ROOT_ENTITY, folder], page: 0 })
    })

    test('ignores the entity that is already focused', () => {
        const state = reduce(
            INITIAL_FOCUS_STATE,
            { type: FOCUS_ACTIONS.ENTER, entity: folder },
            { type: FOCUS_ACTIONS.ENTER, entity: folder }
        )

        expect(state.trail).toHaveLength(2)
    })

    test('goes back to an entity that is already in the trail instead of repeating it', () => {
        const state = reduce(
            INITIAL_FOCUS_STATE,
            { type: FOCUS_ACTIONS.ENTER, entity: folder },
            { type: FOCUS_ACTIONS.ENTER, entity: note },
            { type: FOCUS_ACTIONS.ENTER, entity: folder }
        )

        expect(state.trail).toEqual([ROOT_ENTITY, folder])
    })

    test('keeps a bounded trail', () => {
        let state = INITIAL_FOCUS_STATE

        for (let index = 0; index < HISTORY_LIMIT + 4; index++) {
            state = focusReducer(state, {
                type: FOCUS_ACTIONS.ENTER,
                entity: makeEntity(CONNECTION_TYPES.NOTE, `n${index}`)
            })
        }

        expect(state.trail).toHaveLength(HISTORY_LIMIT)
    })
})

describe('go up and jump', () => {
    test('removes the last entity from the trail', () => {
        const state = reduce(
            INITIAL_FOCUS_STATE,
            { type: FOCUS_ACTIONS.ENTER, entity: folder },
            { type: FOCUS_ACTIONS.ENTER, entity: note },
            { type: FOCUS_ACTIONS.UP }
        )

        expect(state.trail).toEqual([ROOT_ENTITY, folder])
    })

    test('stays at the repository when there is nowhere to go', () => {
        const state = focusReducer(INITIAL_FOCUS_STATE, { type: FOCUS_ACTIONS.UP })

        expect(state).toBe(INITIAL_FOCUS_STATE)
    })

    test('jumps back to any breadcrumb', () => {
        const state = reduce(
            INITIAL_FOCUS_STATE,
            { type: FOCUS_ACTIONS.ENTER, entity: folder },
            { type: FOCUS_ACTIONS.ENTER, entity: note },
            { type: FOCUS_ACTIONS.JUMP, index: 0 }
        )

        expect(state.trail).toEqual([ROOT_ENTITY])
    })
})

describe('change page and origin', () => {
    test('stores the requested page', () => {
        const state = focusReducer(INITIAL_FOCUS_STATE, { type: FOCUS_ACTIONS.PAGE, page: 2 })

        expect(state.page).toBe(2)
    })

    test('starts a new trail from the chosen origin', () => {
        const state = reduce(
            INITIAL_FOCUS_STATE,
            { type: FOCUS_ACTIONS.ENTER, entity: folder },
            { type: FOCUS_ACTIONS.ORIGIN, entity: note }
        )

        expect(state.trail).toEqual([ROOT_ENTITY, note])
    })

    test('collapses the trail when the origin is the repository', () => {
        const state = reduce(
            INITIAL_FOCUS_STATE,
            { type: FOCUS_ACTIONS.ENTER, entity: folder },
            { type: FOCUS_ACTIONS.ORIGIN, entity: ROOT_ENTITY }
        )

        expect(state.trail).toEqual([ROOT_ENTITY])
    })

    test('ignores unknown actions', () => {
        expect(focusReducer(INITIAL_FOCUS_STATE, { type: 'unknown' })).toBe(INITIAL_FOCUS_STATE)
    })
})

describe('valid trail', () => {
    const model = buildConnectionModel({
        notes: MOCK_CONNECTION_NOTES,
        notePaths: MOCK_CONNECTION_NOTE_PATHS,
        files: MOCK_CONNECTION_FILES,
        rootName: 'Vault'
    })

    test('keeps a trail whose entities still exist', () => {
        const trail = [ROOT_ENTITY, folder, note]

        expect(validTrail(trail, model)).toBe(trail)
    })

    test('cuts the trail at the first entity that disappeared', () => {
        const gone = makeEntity(CONNECTION_TYPES.NOTE, 'gone')

        expect(validTrail([ROOT_ENTITY, folder, gone, note], model)).toEqual([ROOT_ENTITY, folder])
    })
})
