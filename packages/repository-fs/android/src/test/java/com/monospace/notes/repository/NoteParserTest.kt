package com.monospace.notes.repository

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class NoteParserTest {
  @Test
  fun `reads list tags from the frontmatter`() {
    val note = parseNote("---\ntags:\n  - one\n  - Two\n---\n\nBody")

    assertEquals(listOf("one", "Two"), note.frontmatterTags)
    assertEquals("Body", note.body.trim())
  }

  @Test
  fun `splits a string tags value on commas and spaces`() {
    val note = parseNote("---\ntags: a, b c\n---\n")

    assertEquals(listOf("a", "b", "c"), note.frontmatterTags)
  }

  @Test
  fun `reads the singular tag key and keeps it out of the property keys`() {
    val note = parseNote("---\ntag: solo\nstatus: open\n---\n")

    assertEquals(listOf("solo"), note.frontmatterTags)
    assertEquals(listOf("status"), note.propertyKeys)
  }

  @Test
  fun `drops tags made only of digits and sanitizes the rest`() {
    val note = parseNote("---\ntags: ['#hash', ' sp ace ', 'a/b/', 2024, v2]\n---\n")

    assertEquals(listOf("hash", "sp-ace", "a/b", "v2"), note.frontmatterTags)
  }

  @Test
  fun `deduplicates tags ignoring case`() {
    val note = parseNote("---\ntags: [Work, work]\n---\n\n#WORK #other")

    assertEquals(listOf("Work"), note.frontmatterTags)
    assertEquals(listOf("WORK", "other"), note.inlineTags)
  }

  @Test
  fun `marks a malformed frontmatter as invalid`() {
    val note = parseNote("---\ntags: [a, b\n---\n\nBody")

    assertTrue(note.invalidFrontmatter)
    assertEquals(emptyList<String>(), note.frontmatterTags)
  }

  @Test
  fun `marks duplicate keys as invalid`() {
    assertTrue(parseNote("---\na: 1\na: 2\n---\n").invalidFrontmatter)
  }

  @Test
  fun `marks a frontmatter that is not a map as invalid`() {
    assertTrue(parseNote("---\n- a\n- b\n---\n").invalidFrontmatter)
  }

  @Test
  fun `keeps dates as plain properties without failing`() {
    val note = parseNote("---\ndate: 2024-01-05\ncreated: 2024-01-05T10:20:30Z\n---\n")

    assertFalse(note.invalidFrontmatter)
    assertEquals(listOf("date", "created"), note.propertyKeys)
  }

  @Test
  fun `treats yes and no as plain strings`() {
    val note = parseNote("---\nyes: yes\nno: no\n---\n")

    assertFalse(note.invalidFrontmatter)
    assertEquals(listOf("yes", "no"), note.propertyKeys)
  }

  @Test
  fun `accepts windows line endings`() {
    val note = parseNote("---\r\ntags: [a]\r\n---\r\n\r\nBody")

    assertEquals(listOf("a"), note.frontmatterTags)
    assertEquals("Body", note.body.trim())
  }

  @Test
  fun `ignores a block that is never closed`() {
    val text = "---\ntags: [a]\n\nBody"
    val note = parseNote(text)

    assertEquals(emptyList<String>(), note.frontmatterTags)
    assertEquals(text, note.body)
  }

  @Test
  fun `finds inline tags and trims trailing slashes`() {
    val note = parseNote("Intro #one and #two/ and #123 and a#nope")

    assertEquals(listOf("one", "two"), note.inlineTags)
  }

  @Test
  fun `ignores inline tags inside code`() {
    val note = parseNote("Text `#inline` and\n\n```\n#fenced\n```\n\n#real")

    assertEquals(listOf("real"), note.inlineTags)
  }

  @Test
  fun `extracts wiki link targets and skips code`() {
    val note = parseNote("See [[Alpha]] and [[Beta|alias]] and `[[Code]]`\n\n```\n[[Fenced]]\n```\n\n[[Gamma#Heading]]")

    assertEquals(listOf("Alpha", "Beta", "Gamma#Heading"), note.links)
  }

  @Test
  fun `returns empty lists for a plain note`() {
    val note = parseNote("Just text")

    assertEquals(emptyList<String>(), note.frontmatterTags)
    assertEquals(emptyList<String>(), note.inlineTags)
    assertEquals(emptyList<String>(), note.links)
    assertEquals(emptyList<String>(), note.propertyKeys)
    assertFalse(note.invalidFrontmatter)
  }

  @Test
  fun `keeps the raw frontmatter in the searchable content`() {
    val note = parseNote("---\ntags: [a]\nstatus: open\n---\n\nBody")

    assertEquals("tags: [a]\nstatus: open\nBody", note.content)
  }

  @Test
  fun `keeps the raw text of an invalid frontmatter in the searchable content`() {
    val note = parseNote("---\ntags: [a, b\n---\n\nBody")

    assertTrue(note.content.startsWith("tags: [a, b\n"))
    assertTrue(note.content.endsWith("Body"))
  }

  @Test
  fun `uses only the body as content when there is no frontmatter`() {
    val note = parseNote("Just text")

    assertEquals("Just text", note.content)
  }
}
