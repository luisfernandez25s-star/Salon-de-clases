import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import Page from './page'

describe('Task manager', () => {
  it('renders the initial tasks', () => {
    render(<Page />)

    expect(
      screen.getByRole('heading', {
        name: 'Ensayo sobre la Revolución Industrial',
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        name: 'Ejercicios de funciones cuadráticas',
      })
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        name: 'Lectura de La Odisea',
      })
    ).toBeInTheDocument()
  })

  it('filters tasks by search query', async () => {
    const user = userEvent.setup()

    render(<Page />)

    const searchInput = screen.getByRole('textbox', {
      name: 'Buscar tarea',
    })

    await user.type(searchInput, 'Odisea')

    expect(
      screen.getByRole('heading', {
        name: 'Lectura de La Odisea',
      })
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        name: 'Ensayo sobre la Revolución Industrial',
      })
    ).not.toBeInTheDocument()
  })

  it('filters tasks by priority', async () => {
    const user = userEvent.setup()

    render(<Page />)

    const prioritySelect = screen.getByRole('combobox', {
      name: 'Filtrar por prioridad',
    })

    await user.selectOptions(prioritySelect, 'Alta')

    expect(
      screen.getByRole('heading', {
        name: 'Ensayo sobre la Revolución Industrial',
      })
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        name: 'Lectura de La Odisea',
      })
    ).not.toBeInTheDocument()
  })

  it('filters tasks by subject', async () => {
    const user = userEvent.setup()

    render(<Page />)

    const subjectSelect = screen.getByRole('combobox', {
      name: 'Filtrar por materia',
    })

    await user.selectOptions(subjectSelect, 'Historia')

    expect(
      screen.getByRole('heading', {
        name: 'Ensayo sobre la Revolución Industrial',
      })
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        name: 'Ejercicios de funciones cuadráticas',
      })
    ).not.toBeInTheDocument()
  })

  it('sorts tasks by due date', async () => {
    const user = userEvent.setup()

    render(<Page />)

    const sortSelect = screen.getByRole('combobox', {
      name: 'Ordenar tareas',
    })

    await user.selectOptions(sortSelect, 'Fecha de entrega')

    const headings = screen.getAllByRole('heading', { level: 3 })

    expect(headings[0]).toHaveTextContent(
      'Mapa conceptual del sistema solar'
    )
  })

  it('shows no tasks when the search has no matches', async () => {
    const user = userEvent.setup()

    render(<Page />)

    const searchInput = screen.getByRole('textbox', {
      name: 'Buscar tarea',
    })

    await user.type(searchInput, 'Tarea inexistente')

    expect(
      screen.queryByRole('heading', {
        name: 'Ensayo sobre la Revolución Industrial',
      })
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        name: 'Lectura de La Odisea',
      })
    ).not.toBeInTheDocument()
  })

  it('can complete a task', async () => {
    const user = userEvent.setup()

    render(<Page />)

    const taskTitle = screen.getByRole('heading', {
      name: 'Ensayo sobre la Revolución Industrial',
    })

    const task = taskTitle.closest('article')

    expect(task).not.toBeNull()

    const completeButton = within(task!).getByRole('button', {
      name: 'Marcar como completada',
    })

    await user.click(completeButton)

    expect(
      within(task!).getByRole('button', {
        name: 'Marcar como pendiente',
      })
    ).toBeInTheDocument()
  })
})