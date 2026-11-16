import { ensureSyntaxTree, syntaxTree } from '@codemirror/language'

import { FULL_TREE_BUDGET_MS } from '@/features/editor/constants/syntax-tree'

export const fullSyntaxTree = (state) => (
    ensureSyntaxTree(state, state.doc.length, FULL_TREE_BUDGET_MS) ?? syntaxTree(state)
)
