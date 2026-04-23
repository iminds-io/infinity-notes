import {NotePreview} from '../interfaces/note'
import clsx from 'clsx'
import React, {useMemo, useState} from 'react'
import {buildConceptIndex} from './concept-dictionary-helpers'

interface Props {
  concepts: NotePreview[]
  onClickBacklink?: (event: React.MouseEvent, path: string) => void
}

export const ConceptDictionary: React.FC<Props> = ({concepts, onClickBacklink}) => {
  const [expanded, setExpanded] = useState(false)
  const [activeBucket, setActiveBucket] = useState('all')
  const conceptIndex = useMemo(() => buildConceptIndex(concepts), [concepts])
  const activeConcepts =
    activeBucket === 'all'
      ? conceptIndex.all
      : conceptIndex.buckets.find((bucket) => bucket.key === activeBucket)?.concepts ||
        conceptIndex.all

  if (!concepts.length) return null

  return (
    <div className="bg-gray-100 rounded-md px-6 py-5">
      <button
        type="button"
        className="text-gray-600 text-lg font-medium"
        onClick={() => setExpanded(!expanded)}
      >
        Concept Dictionary ({concepts.length} concepts)
      </button>

      {expanded && (
        <>
          <div className="flex flex-wrap gap-1 mt-4">
            <button
              type="button"
              onClick={() => setActiveBucket('all')}
              className={clsx(
                'min-h-11 md:min-h-8 rounded-md px-3 text-sm font-medium bg-white text-gray-600 hover:bg-blue-50',
                activeBucket === 'all' && 'bg-blue-100 text-blue-700',
              )}
            >
              All
            </button>
            {conceptIndex.buckets.map((bucket) => (
              <button
                key={bucket.key}
                type="button"
                onClick={() => setActiveBucket(bucket.key)}
                className={clsx(
                  'h-11 min-w-11 md:h-8 md:min-w-8 rounded-md px-2 text-sm font-medium bg-white text-gray-600 hover:bg-blue-50',
                  activeBucket === bucket.key && 'bg-blue-100 text-blue-700',
                )}
              >
                {bucket.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-3 mt-4">
            {activeConcepts.map((concept) => (
              <button
                key={concept.path}
                type="button"
                aria-label={concept.title}
                onClick={(event) => onClickBacklink?.(event, concept.path)}
                className="min-h-11 text-left bg-white rounded-md px-4 py-3 text-gray-600 hover:bg-blue-50"
              >
                <h4 className="text-sm font-medium">{concept.title}</h4>
                <p className="text-sm text-gray-500 truncate mt-1">{concept.snippet}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
