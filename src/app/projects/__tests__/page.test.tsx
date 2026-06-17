import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProjectsPage from '../page'

describe('ProjectsPage – "New Project" button styling', () => {
  it('renders a "New Project" button', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button).toBeInTheDocument()
  })

  it('uses bg-emerald-600 as the default background colour', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('bg-emerald-600')
  })

  it('does not use the old indigo background colour', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).not.toContain('bg-indigo-')
  })

  it('uses hover:bg-emerald-500 for the hover state', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('hover:bg-emerald-500')
  })

  it('keeps text-white colour class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('text-white')
  })

  it('keeps padding classes (px-4 py-2)', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('px-4')
    expect(button.className).toContain('py-2')
  })

  it('keeps font-weight class (font-medium)', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('font-medium')
  })

  it('keeps rounding class (rounded-lg)', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('rounded-lg')
  })

  it('keeps shadow class (shadow-sm)', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('shadow-sm')
  })

  it('keeps transition class (transition-colors)', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('transition-colors')
  })

  it('keeps text-size class (text-sm)', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('text-sm')
  })
})
