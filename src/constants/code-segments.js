export const CODE_SEGMENT_PATTERN = /^[ \t]{0,3}(`{3,}|~{3,})[\s\S]*?(?:^[ \t]{0,3}\1[`~]*[ \t]*$|(?![\s\S]))|(`+)(?!`)[^\n]*?[^`\n]\2(?!`)/gm
export const CODE_SEGMENT_CACHE_SIZE = 4
export const CODE_SEGMENT_CACHE_MIN_LENGTH = 2000
export const CODE_SEGMENT_CACHE_MAX_LENGTH = 1000000
