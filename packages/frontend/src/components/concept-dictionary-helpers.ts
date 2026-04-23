import {NotePreview} from '../interfaces/note'

export interface ConceptBucket {
  key: string
  label: string
  concepts: NotePreview[]
}

export interface ConceptIndex {
  all: NotePreview[]
  buckets: ConceptBucket[]
}

const hangulInitials = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]

const hangulInitialOrder = new Map(
  hangulInitials.map((initial, index) => [initial, index]),
)

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

const firstGrapheme = (value: string): string => {
  return Array.from(value.trim())[0] || ''
}

const hangulInitial = (character: string): string | null => {
  const code = character.codePointAt(0)
  if (code === undefined || code < 0xac00 || code > 0xd7a3) return null

  return hangulInitials[Math.floor((code - 0xac00) / 588)] || null
}

const latinInitial = (character: string): string | null => {
  const normalized = character
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()

  return /^[A-Z]$/.test(normalized) ? normalized : null
}

const bucketKeyForTitle = (title: string): string => {
  const character = firstGrapheme(title)
  if (!character) return '#'

  const hangul = hangulInitial(character)
  if (hangul) return hangul

  const latin = latinInitial(character)
  if (latin) return latin

  if (/^\d$/.test(character)) return '0-9'

  return character
}

const bucketOrder = (key: string): [number, number | string] => {
  const hangulOrder = hangulInitialOrder.get(key)
  if (hangulOrder !== undefined) return [0, hangulOrder]
  if (/^[A-Z]$/.test(key)) return [1, key]
  if (key === '0-9') return [2, key]
  if (key === '#') return [4, key]
  return [3, key]
}

const compareBucketKeys = (a: string, b: string): number => {
  const [aGroup, aValue] = bucketOrder(a)
  const [bGroup, bValue] = bucketOrder(b)

  if (aGroup !== bGroup) return aGroup - bGroup
  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return aValue - bValue
  }
  return collator.compare(String(aValue), String(bValue))
}

const sortConcepts = (concepts: NotePreview[]): NotePreview[] => {
  return [...concepts].sort((a, b) => collator.compare(a.title, b.title))
}

export const buildConceptIndex = (concepts: NotePreview[]): ConceptIndex => {
  const all = sortConcepts(concepts)
  const grouped = all.reduce<Record<string, NotePreview[]>>((groups, concept) => {
    const key = bucketKeyForTitle(concept.title)
    groups[key] = [...(groups[key] || []), concept]
    return groups
  }, {})

  return {
    all,
    buckets: Object.keys(grouped)
      .sort(compareBucketKeys)
      .map((key) => ({
        key,
        label: key,
        concepts: grouped[key],
      })),
  }
}
