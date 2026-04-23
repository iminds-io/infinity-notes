export const backlinkNames = (markdown: string): string[] => {
  return Array.from(markdown.matchAll(/\[\[([^\]]+)\]\]/g)).map((match) => match[1])
}
