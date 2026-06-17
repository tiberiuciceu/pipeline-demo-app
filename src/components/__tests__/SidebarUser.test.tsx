import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SidebarUser } from '../SidebarUser'

describe('SidebarUser', () => {
  it('renders the user name and role', () => {
    render(<SidebarUser />)
    expect(screen.getByText('Tiberiu Ciceu')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('renders the TC avatar initials', () => {
    render(<SidebarUser />)
    expect(screen.getByText('TC')).toBeInTheDocument()
  })

  it('renders a presence indicator for TC', () => {
    render(<SidebarUser />)
    expect(screen.getByLabelText('online: TC')).toBeInTheDocument()
  })
})
