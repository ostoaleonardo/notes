package com.monospace.notes.repository

private const val WHITESPACE = "\\s\\u00a0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000\\ufeff"
private const val INVALID_TAG_CHARS = "!-,.:-@\\[-\\^`{-~"

internal const val TAG_WORD_JOINER = "-"
internal const val TAG_HASH_PREFIX = "#"
internal const val BYTE_ORDER_MARK = '﻿'
internal const val BLANK_CHAR = " "
internal const val HASH_CHAR = '#'

internal val TAG_KEYS = listOf("tags", "tag")

internal val FRONTMATTER = Regex("^---\\r?\\n([\\s\\S]*?)\\r?\\n---(?:\\r?\\n+|\\z)")
internal val FENCED_CODE = Regex("(```|~~~)[\\s\\S]*?(\\1|\\z)")
internal val INLINE_CODE = Regex("`[^`\\n]*`")
internal val INLINE_TAG = Regex("(^|[$WHITESPACE])#([^$WHITESPACE$INVALID_TAG_CHARS]+)")
internal val TAG_SEPARATOR = Regex("[,$WHITESPACE]+")
internal val WHITESPACE_RUN = Regex("[$WHITESPACE]+")
internal val INVALID_TAG_CHAR = Regex("[$INVALID_TAG_CHARS]")
internal val TRAILING_SLASHES = Regex("/+\\z")
internal val NON_NUMERIC = Regex("\\D")
internal val WIKI_LINK = Regex("\\[\\[([^\\]|]+)(?:\\|([^\\]]+))?\\]\\]")

internal val CODE_SEGMENT = Regex(
  "^[ \\t]{0,3}(`{3,}|~{3,})[\\s\\S]*?(?:^[ \\t]{0,3}\\1[`~]*[ \\t]*$|(?![\\s\\S]))|(`+)(?!`)[^\\n]*?[^`\\n]\\2(?!`)",
  RegexOption.MULTILINE
)
