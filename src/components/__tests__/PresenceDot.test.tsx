import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PresenceDot } from '../PresenceDot'

describe('PresenceDot', () => {
  it('renders an online indicator for an online user', () => {
    render(
      <div className="relative">
        <PresenceDot userId="TC" />
      </div>,
    )
    const dot = screen.getByLabelText('online: TC')
    expect(dot.className).toContain('bg-emerald-500')
  })

  it('renders an away indicator for an away user', () => {
    render(
      <div className="relative">
        <PresenceDot userId="MJ" />
      </div>,
    )
    const dot = screen.getByLabelText('away: MJ')
    expect(dot.className).toContain('bg-amber-500')
  })

  it('renders an offline indicator for an offline user', () => {
    render(
      <div className="relative">
        <PresenceDot userId="SP" />
      </div>,
    )
    const dot = screen.getByLabelText('offline: SP')
    expect(dot.className).toContain('bg-gray-400')
  })

  it('renders an offline indicator for an unknown user', () => {
    render(
      <div className="relative">
        <PresenceDot userId="XX" />
      </div>,
    )
    const dot = screen.getByLabelText('offline: XX')
    expect(dot.className).toContain('bg-gray-400')
  })

  it('applies the required positioning and size classes', () => {
    render(
      <div className="relative">
        <PresenceDot userId="AR" />
      </div>,
    )
    const dot = screen.getByLabelText('online: AR')
    expect(dot.className).toContain('absolute')
    expect(dot.className).toContain('bottom-0')
    expect(dot.className).toContain('right-0')
    expect(dot.className).toContain('h-2.5')
    expect(dot.className).toContain('w-2.5')
    expect(dot.className).toContain('rounded-full')
    expect(dot.className).toContain('ring-2')
    expect(dot.className).toContain('ring-white')
  })
})
