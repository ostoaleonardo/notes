package com.monospace.notes.repository

import org.snakeyaml.engine.v2.api.Load
import org.snakeyaml.engine.v2.api.LoadSettings
import org.snakeyaml.engine.v2.schema.CoreSchema

data class ParsedNote(
  val frontmatterTags: List<String>,
  val inlineTags: List<String>,
  val links: List<String>,
  val propertyKeys: List<String>,
  val invalidFrontmatter: Boolean,
  val body: String,
  val content: String
)

private val yaml = ThreadLocal.withInitial {
  Load(LoadSettings.builder().setSchema(CoreSchema()).setAllowDuplicateKeys(false).build())
}

fun parseNote(text: String): ParsedNote {
  val match = FRONTMATTER.find(text)
  val body = if (match == null) text else text.substring(match.value.length)
  val raw = match?.groupValues?.get(1)

  var frontmatter: Map<*, *> = emptyMap<Any, Any>()
  var invalid = false

  if (raw != null && raw.isNotBlank()) {
    try {
      val loaded = yaml.get().loadFromString(raw)
      if (loaded is Map<*, *>) frontmatter = loaded else invalid = true
    } catch (error: Exception) {
      invalid = true
    }
  }

  return ParsedNote(
    frontmatterTags = readFrontmatterTags(frontmatter),
    inlineTags = extractInlineTags(body),
    links = extractWikiLinks(body),
    propertyKeys = frontmatter.keys.map { it.toString() }.filter { it !in TAG_KEYS },
    invalidFrontmatter = invalid,
    body = body,
    content = if (raw.isNullOrEmpty()) body else "$raw\n$body"
  )
}

private fun toTagList(value: Any?): List<Any?> = when (value) {
  is List<*> -> value
  is String -> value.split(TAG_SEPARATOR)
  else -> emptyList()
}

private fun sanitizeTag(name: String): String = name
  .trim { it.isWhitespace() || it == '﻿' }
  .removePrefix(TAG_HASH_PREFIX)
  .replace(WHITESPACE_RUN, TAG_WORD_JOINER)
  .replace(INVALID_TAG_CHAR, "")
  .replace(TRAILING_SLASHES, "")

private fun isValidTag(name: String) = NON_NUMERIC.containsMatchIn(name)

private fun dedupe(tags: List<String>): List<String> {
  val seen = HashSet<String>()
  return tags.filter { seen.add(it.lowercase()) }
}

private fun readFrontmatterTags(frontmatter: Map<*, *>): List<String> {
  val names = TAG_KEYS
    .flatMap { toTagList(frontmatter[it]) }
    .filter { it is String || it is Number }
    .map { sanitizeTag(it.toString()) }
    .filter(::isValidTag)

  return dedupe(names)
}

private fun blank(text: String, pattern: Regex) = pattern.replace(text) { BLANK_CHAR.repeat(it.value.length) }

private fun extractInlineTags(body: String): List<String> {
  if (!body.contains(HASH_CHAR)) return emptyList()

  val visible = blank(blank(blank(body, FRONTMATTER), FENCED_CODE), INLINE_CODE)
  val found = ArrayList<String>()

  for (match in INLINE_TAG.findAll(visible)) {
    val name = match.groupValues[2].replace(TRAILING_SLASHES, "")
    if (isValidTag(name)) found.add(name)
  }

  return dedupe(found)
}

private fun extractWikiLinks(body: String): List<String> {
  val texts = ArrayList<String>()
  var cursor = 0

  fun scan(segment: String) {
    for (match in WIKI_LINK.findAll(segment)) texts.add(match.groupValues[1])
  }

  for (code in CODE_SEGMENT.findAll(body)) {
    scan(body.substring(cursor, code.range.first))
    cursor = code.range.last + 1
  }

  scan(body.substring(cursor))

  return texts
}
