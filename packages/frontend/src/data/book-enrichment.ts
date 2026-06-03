// ABOUTME: Cluster catalogue and per-book enrichment (essence, synthesis, year, kindred).
// ABOUTME: Frontend overlay until the worker can ship the same fields inside BookMeta.

import type {BookMeta} from '@infinity-notes/note-processor'

export interface ClusterDef {
  id: string
  short: string
  name: string
  hue: number
  blurb: string
}

export interface BookEnrichment {
  cluster: string
  essence: string
  synthesis: string
  year: string
  kindred: string[]
}

export interface EnrichedBook extends BookMeta {
  cluster: string
  clusterName: string
  essence: string
  synthesis: string
  year: string
  kindred: string[]
}

export const UNCATEGORIZED_CLUSTER_ID = 'uncategorized'

export const CLUSTERS: ClusterDef[] = [
  {
    id: 'stoic',
    short: 'Stoicism',
    name: 'Stoicism & Self-Mastery',
    hue: 68,
    blurb: 'Master the inner citadel; meet fate with a steady will.',
  },
  {
    id: 'exist',
    short: 'Existence',
    name: 'Meaning & Existence',
    hue: 34,
    blurb: 'Confront the void and forge meaning anyway.',
  },
  {
    id: 'east',
    short: 'Eastern Paths',
    name: 'Eastern Paths',
    hue: 158,
    blurb: 'Yield, flow, and dissolve the grasping self.',
  },
  {
    id: 'mind',
    short: 'The Mind',
    name: 'Mind & Cognition',
    hue: 244,
    blurb: 'How thinking really works — and how it fools us.',
  },
  {
    id: 'cosmos',
    short: 'Cosmos',
    name: 'Cosmos & Science',
    hue: 196,
    blurb: 'Our place in a universe that needs no permission.',
  },
  {
    id: 'power',
    short: 'Power',
    name: 'Power & Society',
    hue: 352,
    blurb: 'The mechanics of force, order and persuasion.',
  },
  {
    id: 'living',
    short: 'Living Well',
    name: 'Practical Wisdom & Living',
    hue: 122,
    blurb: 'The art of an ordinary life, attended to.',
  },
  {
    id: 'just',
    short: 'Justice',
    name: 'Justice & Freedom',
    hue: 92,
    blurb: 'What we owe each other, and the cost of freedom.',
  },
  {
    id: UNCATEGORIZED_CLUSTER_ID,
    short: 'Unsorted',
    name: 'Unsorted Perspectives',
    hue: 24,
    blurb: 'Books still waiting for a shelf.',
  },
]

const CLUSTER_BY_ID = new Map(CLUSTERS.map((c) => [c.id, c]))

export function getCluster(id: string): ClusterDef | null {
  return CLUSTER_BY_ID.get(id) ?? null
}

// Curated enrichment for books currently in the catalog. Each entry mirrors the
// shape we expect to fold into meta.json once the worker schema gains these fields.
const ENRICHMENT: Record<string, BookEnrichment> = {
  sapiens: {
    cluster: 'power',
    essence: 'Shared fictions are what let strangers cooperate at scale.',
    synthesis:
      "Harari reads human history as the spread of imagined orders — money, gods, nations — that make millions of strangers move as one. Cognition gave us the trick; agriculture, empire, science and capitalism are its sequels.",
    year: '2011',
    kindred: ['homo-deus', 'nexus', 'great-mental-models'],
  },
  'homo-deus': {
    cluster: 'mind',
    essence: 'Humanism is being quietly replaced by Dataism.',
    synthesis:
      'Once humanity solved famine, plague and war, its agenda turned to upgrading itself. Harari argues the algorithms that once served us are inheriting the authority to decide what is good — and what counts as human.',
    year: '2016',
    kindred: ['sapiens', 'nexus', 'fabric-of-reality'],
  },
  nexus: {
    cluster: 'power',
    essence: 'Information networks decide which truths a society can hold.',
    synthesis:
      'From oral myth to AI, every leap in how we move information has reshaped political order. Harari traces the cost of mistaking more information for more truth — and what an AI-mediated network does to both.',
    year: '2024',
    kindred: ['sapiens', 'homo-deus', 'narrative-and-numbers'],
  },
  'fabric-of-reality': {
    cluster: 'mind',
    essence:
      'Reality is best explained by four interwoven strands, not one master theory.',
    synthesis:
      'Deutsch braids quantum physics, evolution, computation and epistemology into a single fabric: each is a deeper explanation than any can be on its own, and good explanations are the engine of human progress.',
    year: '1997',
    kindred: ['surfaces-and-essences', 'great-mental-models', 'homo-deus'],
  },
  'surfaces-and-essences': {
    cluster: 'mind',
    essence: 'Analogy is the engine of thought, not its decoration.',
    synthesis:
      'Every concept we hold is a category-in-disguise; every new thought is a leap from one analogy to another. Hofstadter and Sander argue that thinking, at every scale, is the constant mapping of essences across surfaces.',
    year: '2013',
    kindred: ['fabric-of-reality', 'great-mental-models', 'age-of-thinking'],
  },
  'great-mental-models': {
    cluster: 'mind',
    essence: 'Borrow models from every discipline; let them argue with each other.',
    synthesis:
      'A latticework of models — from physics to biology to economics — gives you more vantage points on the same situation. The argument among them is where judgement actually lives.',
    year: '2019',
    kindred: ['surfaces-and-essences', 'fabric-of-reality', 'narrative-and-numbers'],
  },
  'narrative-and-numbers': {
    cluster: 'power',
    essence: 'Every valuation is a story dressed in numbers.',
    synthesis:
      "Damodaran insists the storyteller and the number-cruncher need each other: a price without a narrative is brittle, a narrative without numbers is wishful. Good investing is the discipline of holding both honest at once.",
    year: '2017',
    kindred: ['nexus', 'great-mental-models'],
  },
  'age-of-thinking': {
    cluster: 'mind',
    essence: 'A handful of Greek tools — metaphor, principle, reason — built our minds.',
    synthesis:
      '김용규 traces civilisation back to five thinking tools the Greeks bequeathed us: metaphor, archē, logos, arithmos and dialectic. They are still the scaffolding of how any modern mind actually thinks.',
    year: '2014',
    kindred: ['surfaces-and-essences', 'great-mental-models'],
  },
}

function firstSentence(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ''
  const sentence = trimmed.match(/[^.!?]+[.!?]/)?.[0]
  return (sentence ?? trimmed).trim()
}

export function enrichBook(book: BookMeta): EnrichedBook {
  const overlay = ENRICHMENT[book.id]
  const clusterId = overlay?.cluster ?? UNCATEGORIZED_CLUSTER_ID
  const cluster = getCluster(clusterId) ?? getCluster(UNCATEGORIZED_CLUSTER_ID)!
  return {
    ...book,
    cluster: cluster.id,
    clusterName: cluster.name,
    essence: overlay?.essence ?? firstSentence(book.description),
    synthesis: overlay?.synthesis ?? book.description,
    year: overlay?.year ?? '',
    kindred: overlay?.kindred ?? [],
  }
}

export function enrichBooks(books: BookMeta[]): EnrichedBook[] {
  return books.map(enrichBook)
}
