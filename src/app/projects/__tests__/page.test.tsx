import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProjectsPage from '../page'

describe('ProjectsPage — "New Project" button styling', () => {
  it('renders a "New Project" button', () => {
    render(<ProjectsPage />)
    expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument()
  })

  it('has bg-emerald-600 as the default background class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('bg-emerald-600')
  })

  it('does NOT use the old indigo background class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).not.toContain('bg-indigo-600')
  })

  it('has hover:bg-emerald-500 for the hover state', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('hover:bg-emerald-500')
  })

  it('does NOT use hover:bg-indigo-500 for the hover state', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).not.toContain('hover:bg-indigo-500')
  })

  it('retains white text colour class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('text-white')
  })

  it('retains padding classes', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('px-4')
    expect(button.className).toContain('py-2')
  })

  it('retains font-weight class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('font-medium')
  })

  it('retains rounded-lg class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('rounded-lg')
  })

  it('retains shadow class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('shadow-sm')
  })

  it('retains transition-colors class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('transition-colors')
  })

  it('retains text-sm class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('text-sm')
  })
})
