const decoder = new TextDecoder()

export const readFileText = async (file) => decoder.decode(await file.bytes())
