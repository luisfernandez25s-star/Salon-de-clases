'use client'

import { useMemo, useState } from 'react'
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Edit3,
  Inbox,
  LayoutDashboard,
  ListFilter,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'

type Priority = 'Alta' | 'Media' | 'Baja'
type Task = {
  id: number
  title: string
  subject: string
  description: string
  due: string
  priority: Priority
  reminder: boolean
  completed: boolean
}

const initialTasks: Task[] = [
  { id: 1, title: 'Ensayo sobre la Revolución Industrial', subject: 'Historia', description: 'Investigar las causas y consecuencias principales.', due: '2026-09-10', priority: 'Alta', reminder: true, completed: false },
  { id: 2, title: 'Ejercicios de funciones cuadráticas', subject: 'Matemáticas', description: 'Resolver los ejercicios 12 al 25 de la guía.', due: '2026-09-12', priority: 'Media', reminder: true, completed: false },
  { id: 3, title: 'Presentación: Ecosistemas', subject: 'Biología', description: 'Preparar diapositivas sobre ecosistemas locales.', due: '2026-09-15', priority: 'Media', reminder: false, completed: false },
  { id: 4, title: 'Lectura de La Odisea', subject: 'Lengua', description: 'Leer cantos V al VIII y preparar preguntas.', due: '2026-09-18', priority: 'Baja', reminder: false, completed: false },
  { id: 5, title: 'Mapa conceptual del sistema solar', subject: 'Ciencias', description: 'Usar colores para diferenciar planetas y satélites.', due: '2026-09-06', priority: 'Baja', reminder: false, completed: true },
]

const subjectColors: Record<string, string> = { Historia: 'coral', Matemáticas: 'blue', Biología: 'green', Lengua: 'purple', Ciencias: 'gold' }

function formatDue(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(year, month - 1, day))
}

function daysUntil(date: string) {
  const target = new Date(`${date}T12:00:00`).getTime()
  return Math.ceil((target - new Date('2026-09-08T12:00:00').getTime()) / 86400000)
}

export default function Page() {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeView, setActiveView] = useState<'all' | 'pending' | 'completed' | 'calendar'>('all')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [subject, setSubject] = useState('Todas las materias')
  const [savedSubjects, setSavedSubjects] = useState<string[]>([])
  const [priority, setPriority] = useState('Todas')
  const [sort, setSort] = useState('Fecha de entrega')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

  const pending = tasks.filter((task) => !task.completed)
  const completed = tasks.filter((task) => task.completed)
  const subjects = Array.from(new Set([...tasks.map((task) => task.subject), ...savedSubjects]))
  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => activeView === 'all' || activeView === 'calendar' || (activeView === 'pending' ? !task.completed : task.completed))
      .filter((task) => subject === 'Todas las materias' || task.subject === subject)
      .filter((task) => priority === 'Todas' || task.priority === priority)
      .filter((task) => `${task.title} ${task.subject}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => sort === 'Prioridad' ? ({ Alta: 0, Media: 1, Baja: 2 }[a.priority] - { Alta: 0, Media: 1, Baja: 2 }[b.priority]) : a.due.localeCompare(b.due))
  }, [tasks, activeView, subject, priority, query, sort])

  function toggleTask(id: number) { setTasks((current) => current.map((task) => task.id === id ? { ...task, completed: !task.completed } : task)) }
  function deleteTask(id: number) { setTasks((current) => current.filter((task) => task.id !== id)) }
  function openNew() { setEditing(null); setModalOpen(true) }
  function openEdit(task: Task) { setEditing(task); setModalOpen(true) }
  function saveTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const nextSubject = String(data.get('subject') || '').trim()
    if (!nextSubject) return
    if (!savedSubjects.includes(nextSubject)) setSavedSubjects((current) => [...current, nextSubject])
    const next: Task = { id: editing?.id ?? Date.now(), title: String(data.get('title')), subject: nextSubject, description: String(data.get('description')), due: String(data.get('due')), priority: String(data.get('priority')) as Priority, reminder: data.get('reminder') === 'on', completed: editing?.completed ?? false }
    setTasks((current) => editing ? current.map((task) => task.id === editing.id ? next : task) : [next, ...current])
    setModalOpen(false)
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span>Salón de clase</span></div>
        <div className="profile"><div className="avatar">NS</div><div><strong>Nestor Saavedra</strong><span>Estudiante</span></div><MoreHorizontal className="muted-icon" /></div>
        <nav className="nav-list" aria-label="Navegación principal">
          <button className={`nav-item ${activeView === 'all' ? 'active' : ''}`} onClick={() => { setActiveView('all'); setSubject('Todas las materias'); setPriority('Todas') }}><LayoutDashboard /> Resumen</button>
          <button className={`nav-item ${activeView === 'pending' ? 'active' : ''}`} onClick={() => setActiveView('pending')}><Inbox /> Mis tareas <span className="nav-count">{pending.length}</span></button>
          <button className={`nav-item ${activeView === 'completed' ? 'active' : ''}`} onClick={() => setActiveView('completed')}><CheckCircle2 /> Completadas</button>
          <button className={`nav-item ${activeView === 'calendar' ? 'active' : ''}`} onClick={() => { setActiveView('calendar'); setSubject('Todas las materias'); setPriority('Todas'); setSort('Fecha de entrega') }}><CalendarDays /> Calendario</button>
        </nav>
        <div className="sidebar-bottom"><div className="tip-card"><Sparkles /><strong>Un paso a la vez</strong><span>Organiza tu día y alcanza tus metas.</span></div><button className="nav-item" onClick={() => setSettingsOpen(true)}><Settings2 /> Ajustes</button></div>
      </aside>

      <section className="content">
        <header className="topbar"><div className="mobile-brand brand">Salón de clase</div><div className="top-actions"><button className="icon-button" aria-label="Notificaciones"><Bell /><span className="notification-dot" /></button><button className="add-button" onClick={openNew}><Plus /> Nueva tarea</button></div></header>
        <div className="content-inner">
          <div className="welcome"><div><p className="eyebrow">Lunes, 8 de septiembre de 2026</p><h1>Hola, Nestor</h1><p className="intro">Tienes <strong>{pending.length} tareas pendientes</strong>. ¡Tú puedes con todo!</p></div><div className="progress-card"><div className="progress-ring"><span>{Math.round((completed.length / tasks.length) * 100)}%</span></div><div><span>Progreso semanal</span><strong>{completed.length} de {tasks.length} tareas</strong></div></div></div>
          <div className="stats-grid"><button className={`stat-card ${activeView === 'pending' ? 'selected' : ''}`} onClick={() => setActiveView('pending')}><span className="stat-icon peach"><Clock3 /></span><span><small>Por hacer</small><strong>{pending.length}</strong></span><span className="stat-arrow">→</span></button><button className={`stat-card ${activeView === 'completed' ? 'selected' : ''}`} onClick={() => setActiveView('completed')}><span className="stat-icon mint"><Check /></span><span><small>Completadas</small><strong>{completed.length}</strong></span><span className="stat-arrow">→</span></button><button className="stat-card"><span className="stat-icon lavender"><CalendarDays /></span><span><small>Vencen pronto</small><strong>{pending.filter((task) => daysUntil(task.due) <= 7).length}</strong></span><span className="stat-arrow">→</span></button></div>
          <div className="section-heading"><div><h2>{activeView === 'completed' ? 'Tareas completadas' : activeView === 'pending' ? 'Tareas pendientes' : activeView === 'calendar' ? 'Calendario de entregas' : 'Todas tus tareas'}</h2><p>Ten el control de tus entregas</p></div><button className="text-button" onClick={() => { setActiveView('all'); setSubject('Todas las materias'); setPriority('Todas') }}>Ver todas <span>→</span></button></div>
          <div className="toolbar"><div className="search-box"><Search /><input aria-label="Buscar tarea" placeholder="Buscar tarea..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><select aria-label="Filtrar por materia" value={subject} onChange={(event) => setSubject(event.target.value)}><option>Todas las materias</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filtrar por prioridad" value={priority} onChange={(event) => setPriority(event.target.value)}><option>Todas</option><option>Alta</option><option>Media</option><option>Baja</option></select><select aria-label="Ordenar tareas" value={sort} onChange={(event) => setSort(event.target.value)}><option>Fecha de entrega</option><option>Prioridad</option></select><button className="filter-button" aria-label="Más filtros"><ListFilter /></button></div>
          <div className="task-list">{visibleTasks.map((task) => <article className={`task-row ${task.completed ? 'is-complete' : ''}`} key={task.id}><button className={`check-button ${task.completed ? 'checked' : ''}`} aria-label={task.completed ? 'Marcar como pendiente' : 'Marcar como completada'} onClick={() => toggleTask(task.id)}>{task.completed && <Check />}</button><div className="task-main"><div className="task-title-line"><h3>{task.title}</h3><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span></div><p>{task.description}</p><div className="task-meta"><span className={`subject ${subjectColors[task.subject] || 'blue'}`}><BookOpen /> {task.subject}</span><span><CalendarDays /> Entrega: <strong>{formatDue(task.due)}</strong></span>{task.reminder && <span><Bell /> Recordatorio</span>}</div></div><div className="task-actions"><span className={daysUntil(task.due) <= 3 && !task.completed ? 'urgent' : ''}>{task.completed ? 'Listo' : daysUntil(task.due) === 0 ? 'Hoy' : daysUntil(task.due) === 1 ? 'Mañana' : `En ${daysUntil(task.due)} días`}</span><button aria-label={`Editar ${task.title}`} onClick={() => openEdit(task)}><Edit3 /></button><button aria-label={`Eliminar ${task.title}`} onClick={() => deleteTask(task.id)}><Trash2 /></button></div></article>)}{visibleTasks.length === 0 && <div className="empty-state"><CheckCircle2 /><h3>No hay tareas aquí</h3><p>Prueba con otro filtro o agrega una tarea nueva.</p></div>}</div>
          <div className="bottom-grid"><section className="upcoming-card"><div className="card-heading"><div><h2>Próximas entregas</h2><p>No pierdas de vista lo importante</p></div><CalendarDays /></div>{pending.slice(0, 3).map((task) => <div className="upcoming-item" key={task.id}><div className={`date-block ${subjectColors[task.subject] || 'blue'}`}><strong>{task.due.slice(8)}</strong><span>{new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(`${task.due}T12:00:00`)).replace('.', '')}</span></div><div><strong>{task.title}</strong><span>{task.subject}</span></div><span className="upcoming-days">{daysUntil(task.due) <= 1 ? 'Pronto' : `${daysUntil(task.due)} días`}</span></div>)}</section><section className="quote-card"><div className="quote-mark">“</div><blockquote>El éxito es la suma de pequeños esfuerzos repetidos día tras día.</blockquote><span>— Robert Collier</span><div className="quote-stars">✦ ✦ ✦</div></section></div>
        </div>
      </section>
      {settingsOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSettingsOpen(false)}><section className="task-modal" aria-labelledby="settings-title"><div className="modal-header"><div><p className="eyebrow">Preferencias</p><h2 id="settings-title">Ajustes</h2></div><button type="button" className="close-button" aria-label="Cerrar ajustes" onClick={() => setSettingsOpen(false)}><X /></button></div><label>Nombre del estudiante<input defaultValue="Nestor Saavedra" aria-label="Nombre del estudiante" /></label><label className="reminder-label"><span>Mostrar tareas completadas</span><span className="toggle-wrap"><input type="checkbox" defaultChecked aria-label="Mostrar tareas completadas" /><span className="toggle-slider" /></span></label><button type="button" className="add-button" onClick={() => setSettingsOpen(false)}>Guardar ajustes</button></section></div>}
      {modalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setModalOpen(false)}><form className="task-modal" onSubmit={saveTask}><div className="modal-header"><div><p className="eyebrow">{editing ? 'Editar tarea' : 'Nueva tarea'}</p><h2>{editing ? 'Actualiza los detalles' : '¿Qué tienes pendiente?'}</h2></div><button type="button" className="close-button" aria-label="Cerrar" onClick={() => setModalOpen(false)}><X /></button></div><label>Nombre de la tarea<input required name="title" defaultValue={editing?.title} placeholder="Ej. Examen de matemáticas" /></label><div className="form-grid"><label>Materia<input required name="subject" list="saved-subjects" defaultValue={editing?.subject ?? ''} placeholder="Escribe la materia" /><datalist id="saved-subjects">{subjects.map((item) => <option key={item} value={item} />)}</datalist><small className="field-hint">Escribe una nueva o selecciona una guardada.</small></label><label>Fecha de entrega<input required type="date" name="due" defaultValue={editing?.due ?? '2026-09-20'} /></label></div>{savedSubjects.length > 0 && <div className="saved-subjects"><span>Materias guardadas</span><div>{savedSubjects.map((item) => <button type="button" key={item} className="saved-subject" onClick={() => setSavedSubjects((current) => current.filter((subject) => subject !== item))}>{item}<X /></button>)}</div><small>Haz clic en una materia para eliminarla.</small></div>}<label>Descripción<textarea name="description" defaultValue={editing?.description} placeholder="Añade una breve descripción..." rows={3} /></label><div className="form-grid"><label>Prioridad<select name="priority" defaultValue={editing?.priority ?? 'Media'}><option>Alta</option><option>Media</option><option>Baja</option></select></label><label className="reminder-label"><span>Recordatorio</span><span className="toggle-wrap"><input type="checkbox" name="reminder" defaultChecked={editing?.reminder ?? true} /><span className="toggle" /></span></label></div><button className="save-button" type="submit"><Plus /> {editing ? 'Guardar cambios' : 'Añadir tarea'}</button></form></div>}
    </main>
  )
}
