import { useMemo } from 'react'
import { Directory, File, FileMode } from 'expo-file-system'

import {
    NOTE_FILE_EXTENSION,
    METADATA_FILENAME,
    VERSIONS_FILENAME_SUFFIX,
    TEMPLATES_FOLDER_NAME,
    IMAGES_FOLDER_NAME,
    RESERVED_FOLDER_NAMES,
    SIDECAR_FILENAMES
} from '@/constants/file-storage'
import { MIME_TYPES } from '@/constants/mime-types'

export function useFileStorage() {
    const listEntries = (directoryUri) => new Directory(directoryUri).list()

    const findFile = (directoryUri, filename) => (
        listEntries(directoryUri).find((entry) => (
            entry instanceof File && entry.name === filename
        ))
    )

    const findDirectory = (directoryUri, name) => (
        listEntries(directoryUri).find((entry) => (
            entry instanceof Directory && entry.name === name
        ))
    )

    const createSubdirectory = (directoryUri, name) => (
        new Directory(directoryUri).createDirectory(name)
    )

    const getOrCreateTemplatesFolder = (directoryUri) => (
        findDirectory(directoryUri, TEMPLATES_FOLDER_NAME) || createSubdirectory(directoryUri, TEMPLATES_FOLDER_NAME)
    )

    const getOrCreateImagesFolder = (directoryUri) => (
        findDirectory(directoryUri, IMAGES_FOLDER_NAME) || createSubdirectory(directoryUri, IMAGES_FOLDER_NAME)
    )

    const listMarkdownFiles = (directoryUri) => (
        listEntries(directoryUri).filter((entry) => (
            entry instanceof File &&
            !SIDECAR_FILENAMES.includes(entry.name) &&
            entry.name.toLowerCase().endsWith(NOTE_FILE_EXTENSION)
        ))
    )

    const listSubdirectories = (directoryUri) => (
        listEntries(directoryUri).filter((entry) => (
            entry instanceof Directory &&
            !entry.name.startsWith('.') &&
            !RESERVED_FOLDER_NAMES.includes(entry.name)
        ))
    )

    const deleteDirectory = (directoryUri) => {
        new Directory(directoryUri).delete()
    }

    const directoryExists = (directoryUri) => new Directory(directoryUri).exists

    const copyDirectoryContents = (source, destination) => {
        source.list().forEach((entry) => {
            if (entry instanceof Directory) {
                copyDirectoryContents(entry, destination.createDirectory(entry.name))
            } else {
                destination.createFile(entry.name, entry.type || null).write(entry.bytesSync())
            }
        })
    }

    const renameDirectory = (directoryUri, parentUri, newName) => {
        const directory = new Directory(directoryUri)
        const newDirectory = new Directory(parentUri).createDirectory(newName)

        copyDirectoryContents(directory, newDirectory)
        directory.delete()

        return newDirectory.uri
    }

    const copyImageFile = async (sourceUri, directoryUri, filename) => {
        const source = new File(sourceUri)
        const bytes = await source.bytes()
        const file = new Directory(directoryUri).createFile(filename, source.type || MIME_TYPES.JPEG)
        file.write(bytes)
        return file
    }

    const writeNoteFile = (directoryUri, filename, content, mimeType = MIME_TYPES.MARKDOWN) => {
        const existing = findFile(directoryUri, filename)

        if (!existing) {
            const file = new Directory(directoryUri).createFile(filename, mimeType)
            file.write(content)
            return file
        }

        const handle = existing.open(FileMode.Truncate)
        try {
            handle.writeBytes(new TextEncoder().encode(content))
        } finally {
            handle.close()
        }
        return existing
    }

    const renameNoteFile = async (directoryUri, oldFilename, newFilename) => {
        const file = findFile(directoryUri, oldFilename)
        if (!file) return

        const content = await file.text()
        writeNoteFile(directoryUri, newFilename, content)
        file.delete()
    }

    const deleteNoteFile = (directoryUri, filename) => {
        const file = findFile(directoryUri, filename)
        if (file) file.delete()
    }

    const clearRepository = (directoryUri) => {
        listMarkdownFiles(directoryUri).forEach((file) => file.delete())
        SIDECAR_FILENAMES.forEach((filename) => deleteNoteFile(directoryUri, filename))
    }

    const readJson = async (directoryUri, filename, fallback) => {
        const file = findFile(directoryUri, filename)
        if (!file) return fallback

        try {
            return JSON.parse(await file.text())
        } catch {
            return fallback
        }
    }

    const writeJson = (directoryUri, filename, data) => {
        writeNoteFile(directoryUri, filename, JSON.stringify(data), MIME_TYPES.JSON)
    }

    const readMetadata = (directoryUri) => readJson(directoryUri, METADATA_FILENAME, {})
    const writeMetadata = (directoryUri, metadata) => writeJson(directoryUri, METADATA_FILENAME, metadata)

    const readVersions = (directoryUri, filename) => readJson(directoryUri, filename + VERSIONS_FILENAME_SUFFIX, [])
    const writeVersions = (directoryUri, filename, versions) => writeJson(directoryUri, filename + VERSIONS_FILENAME_SUFFIX, versions)
    const deleteVersions = (directoryUri, filename) => deleteNoteFile(directoryUri, filename + VERSIONS_FILENAME_SUFFIX)

    const renameVersions = async (directoryUri, oldFilename, newFilename) => {
        const versions = await readVersions(directoryUri, oldFilename)
        if (!versions.length) return

        writeVersions(directoryUri, newFilename, versions)
        deleteVersions(directoryUri, oldFilename)
    }

    return useMemo(() => ({
        findFile,
        findDirectory,
        listMarkdownFiles,
        listSubdirectories,
        writeNoteFile,
        renameNoteFile,
        deleteNoteFile,
        clearRepository,
        deleteDirectory,
        directoryExists,
        renameDirectory,
        readMetadata,
        writeMetadata,
        readVersions,
        writeVersions,
        deleteVersions,
        renameVersions,
        readJson,
        writeJson,
        createSubdirectory,
        getOrCreateTemplatesFolder,
        getOrCreateImagesFolder,
        copyImageFile
    }), [])
}
