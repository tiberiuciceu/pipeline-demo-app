import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProjectsPage from '../page'

describe('ProjectsPage – "New Project" button styling', () => {
  it('renders the "New Project" button', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button).toBeInTheDocument()
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

  it('does not use any indigo background classes', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).not.toMatch(/bg-indigo-\d+/)
    expect(button.className).not.toMatch(/hover:bg-indigo-\d+/)
  })

  it('retains text-white class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('text-white')
  })

  it('retains padding classes px-4 and py-2', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('px-4')
    expect(button.className).toContain('py-2')
  })

  it('retains font-medium class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('font-medium')
  })

  it('retains rounded-lg class', () => {
    render(<ProjectsPage />)
    const button = screen.getByRole('button', { name: /new project/i })
    expect(button.className).toContain('rounded-lg')
  })

  it('retains shadow-sm class', () => {
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
