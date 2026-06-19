import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProjectsPage from '../page'

describe('ProjectsPage — New Project button', () => {
  it('renders the New Project button', () => {
    render(<ProjectsPage />)
    expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument()
  })

  it('uses bg-emerald-600 as the default background class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('bg-emerald-600')
  })

  it('uses hover:bg-emerald-500 for the hover state', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('hover:bg-emerald-500')
  })

  it('does NOT use indigo classes for the background', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).not.toContain('bg-indigo')
    expect(button.className).not.toContain('hover:bg-indigo')
  })

  it('keeps text-white class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('text-white')
  })

  it('keeps padding classes px-4 and py-2', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('px-4')
    expect(button.className).toContain('py-2')
  })

  it('keeps font-medium class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('font-medium')
  })

  it('keeps rounded-lg class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('rounded-lg')
  })

  it('keeps shadow-sm class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('shadow-sm')
  })

  it('keeps transition-colors class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('transition-colors')
  })

  it('keeps text-sm class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('text-sm')
  })
})
