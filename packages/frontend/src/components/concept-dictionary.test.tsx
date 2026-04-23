import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {ConceptDictionary} from './concept-dictionary'
import {NotePreview} from '../interfaces/note'

const concept = (title: string): NotePreview => ({
  path: `concepts/${title}`,
  title,
  snippet: `${title} snippet`,
  type: 'concept',
})

describe('ConceptDictionary', () => {
  it('should show Korean concepts after expanding the dictionary', async () => {
    const user = userEvent.setup()

    render(
      <ConceptDictionary
        concepts={[
          concept('개념적 혼성'),
          concept('레토리케'),
          concept('로고스'),
          concept('메타포라'),
        ]}
      />,
    )

    await user.click(screen.getByRole('button', {name: 'Concept Dictionary (4 concepts)'}))

    expect(screen.getByRole('button', {name: 'All'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'ㄱ'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'ㄹ'})).toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'A'})).not.toBeInTheDocument()
    expect(screen.getByRole('button', {name: '개념적 혼성'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: '레토리케'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: '로고스'})).toBeInTheDocument()
  })

  it('should filter Korean concepts by initial consonant', async () => {
    const user = userEvent.setup()

    render(
      <ConceptDictionary
        concepts={[concept('개념적 혼성'), concept('레토리케'), concept('로고스')]}
      />,
    )

    await user.click(screen.getByRole('button', {name: 'Concept Dictionary (3 concepts)'}))
    await user.click(screen.getByRole('button', {name: 'ㄹ'}))

    expect(screen.queryByRole('button', {name: '개념적 혼성'})).not.toBeInTheDocument()
    expect(screen.getByRole('button', {name: '레토리케'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: '로고스'})).toBeInTheDocument()
  })

  it('should call onClickBacklink with the selected concept path', async () => {
    const user = userEvent.setup()
    const onClickBacklink = vi.fn()

    render(
      <ConceptDictionary
        concepts={[concept('개념적 혼성')]}
        onClickBacklink={onClickBacklink}
      />,
    )

    await user.click(screen.getByRole('button', {name: 'Concept Dictionary (1 concepts)'}))
    await user.click(screen.getByRole('button', {name: '개념적 혼성'}))

    expect(onClickBacklink).toHaveBeenCalledWith(
      expect.any(Object),
      'concepts/개념적 혼성',
    )
  })
})
