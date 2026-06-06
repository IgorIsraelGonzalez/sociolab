import { useState, useEffect } from 'react'
import './App.css'

const MODULES = {
  ant: {
    name: 'ANT y ensamblajes',
    color: '#1d9e75',
    icon: '🕸️',
    authors: 'Latour · Callon · Law',
    system: `Eres un tutor experto en Teoría del Actor-Red (ANT) y en la obra de Bruno Latour, Michel Callon y John Law. Tu rol es guiar a estudiantes de ciencias sociales a través de lecciones que combinan teoría y práctica. Genera lecciones en exactamente 3 pasos. Responde SOLO con JSON válido, sin backticks ni texto adicional.`
  },
  ranciere: {
    name: 'Política y disenso',
    color: '#7f77dd',
    icon: '⚡',
    authors: 'Rancière · Mouffe',
    system: `Eres un tutor experto en la filosofía política de Jacques Rancière y Chantal Mouffe. Tu rol es guiar a estudiantes de ciencias sociales a través de lecciones sobre política, disenso, orden policial e irrupción. Genera lecciones en 3 pasos. Responde SOLO con JSON válido, sin backticks ni texto adicional.`
  },
  juventud: {
    name: 'Culturas juveniles',
    color: '#d85a30',
    icon: '🧑‍🤝‍🧑',
    authors: 'Feixa · Reguillo',
    system: `Eres un tutor experto en estudios de juventud, culturas juveniles y adscripciones identitarias. Tu marco teórico incluye a Carles Feixa, Rossana Reguillo y el enfoque de pánico moral. Genera lecciones en 3 pasos. Responde SOLO con JSON válido, sin backticks ni texto adicional.`
  }
}

const DEMO = {
  ant: [
    { type: 'theory', title: 'El actor-red', content: 'Para Latour, un <strong>actor</strong> no es solo un humano: es cualquier entidad que produce diferencia en una red. Un semáforo, una vacuna o una protesta son actores porque modifican relaciones. La <strong>red</strong> no es metáfora: es el tejido concreto de asociaciones que sostiene cualquier fenómeno social. No hay "lo social" separado de esas conexiones; lo social es el rastro que dejan las asociaciones cuando se ensamblan.' },
    { type: 'multiple_choice', question: '¿Qué distingue al concepto de "actor" en la ANT respecto a la sociología clásica?', options: ['Solo los humanos pueden ser actores sociales', 'Los actores incluyen entidades no humanas si producen diferencia', 'Los actores son siempre instituciones formales', 'Un actor es equivalente a un individuo racional'], correct: 1, explanation: 'La ANT amplía la noción de agencia: cualquier entidad —humana o no— que produzca diferencia en una red cuenta como actor. Esto es central para analizar cómo objetos y tecnologías co-constituyen lo social.' },
    { type: 'open', question: 'Piensa en una situación cotidiana en tu contexto. ¿Qué actores no humanos identificas? ¿Cómo modifican las relaciones entre los actores humanos?', criteria: 'Una respuesta sólida identifica al menos un actor no humano, explica cómo produce diferencia en la red, y evita reducir la explicación a intenciones humanas.' }
  ],
  ranciere: [
    { type: 'theory', title: 'Orden policial vs irrupción política', content: 'Para Rancière, el <strong>orden policial</strong> no es la policía: es la distribución de lo sensible, la asignación de lugares, voces y visibilidades dentro de una comunidad. La <strong>política</strong> ocurre cuando los que no tienen parte irrumpen y reconfiguran esa distribución. No es negociación: es disenso, fractura del consenso.' },
    { type: 'multiple_choice', question: 'Una protesta estudiantil que exige ser escuchada en decisiones curriculares, ¿cómo la entendería Rancière?', options: ['Como negociación dentro del orden policial', 'Como irrupción política que cuestiona la distribución de lo sensible', 'Como disfunción del sistema educativo', 'Como manifestación de intereses de clase'], correct: 1, explanation: 'Rancière llamaría a esto política: los estudiantes reconfiguran quién tiene derecho a hablar sobre la educación. Es disenso, no demanda dentro del sistema.' },
    { type: 'open', question: 'Describe un momento de irrupción política reciente. ¿Quiénes "no tenían parte" antes de ese momento? ¿Qué redistribución de lo sensible implicó?', criteria: 'Debe identificar el orden policial previo, quiénes irrumpen, y qué visibilidad nueva se produce.' }
  ],
  juventud: [
    { type: 'theory', title: 'Culturas juveniles y adscripciones identitarias', content: 'Las <strong>culturas juveniles</strong> no son etapas de tránsito hacia la adultez: son formas propias de habitar el mundo. Carles Feixa distingue entre <strong>condición</strong> juvenil (posición estructural) e <strong>imagen</strong> juvenil (representación cultural). Las adscripciones identitarias no son identidades esenciales sino ensamblajes relacionales que se activan en contextos específicos.' },
    { type: 'multiple_choice', question: 'Un joven que participa en un colectivo feminista y también en una barra de fútbol, ¿cómo lo describirían los estudios de culturas juveniles?', options: ['Como sujeto con identidad contradictoria', 'Como portador de adscripciones identitarias múltiples y situacionales', 'Como caso de anomia social', 'Como individuo sin identidad definida'], correct: 1, explanation: 'Los estudios de juventud rechazan identidades esenciales. Las adscripciones son relacionales y contextuales: el mismo sujeto activa diferentes pertenencias según el espacio y la práctica.' },
    { type: 'open', question: 'Observa una expresión cultural juvenil que conozcas en tu contexto cercano. ¿Qué prácticas y significaciones la caracterizan? ¿Qué condición juvenil refleja?', criteria: 'Debe distinguir prácticas visibles de condiciones estructurales y aplicar la distinción condición/imagen.' }
  ]
}

function App() {
  const [screen, setScreen] = useState('home')
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem('sl_xp') || '0'))
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem('sl_streak') || '0'))
  const [progress, setProgress] = useState(() => JSON.parse(localStorage.getItem('sl_progress') || '{}'))
  const [currentModule, setCurrentModule] = useState(null)
  const [steps, setSteps] = useState([])
  const [stepIndex, setStepIndex] = useState(0)
  const [sessionXP, setSessionXP] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [openAnswer, setOpenAnswer] = useState('')

  useEffect(() => { localStorage.setItem('sl_xp', xp) }, [xp])
  useEffect(() => { localStorage.setItem('sl_streak', streak) }, [streak])
  useEffect(() => { localStorage.setItem('sl_progress', JSON.stringify(progress)) }, [progress])

  const globalPct = Math.min(100, (xp / 200) * 100)

  async function startModule(modId) {
    setCurrentModule(modId)
    setSessionXP(0)
    setSessionCorrect(0)
    setStepIndex(0)
    setSteps([])
    setAnswered(false)
    setSelectedOption(null)
    setFeedback(null)
    setOpenAnswer('')
    setScreen('lesson')
    setLoading(true)

    try {
      const mod = MODULES[modId]
      const prompt = `Genera una lección completa sobre "${mod.name}" con exactamente 3 pasos en este formato JSON:
{
  "steps": [
    {
      "type": "theory",
      "title": "título corto del concepto",
      "content": "explicación de 80-120 palabras con un ejemplo concreto. Usa <strong> para términos clave."
    },
    {
      "type": "multiple_choice",
      "question": "pregunta de identificación o aplicación del concepto",
      "options": ["opción A", "opción B", "opción C", "opción D"],
      "correct": 0,
      "explanation": "explicación de 40-60 palabras de por qué es correcta"
    },
    {
      "type": "open",
      "question": "describe un caso real o hipotético donde apliques el concepto clave",
      "criteria": "qué elementos debe mencionar una respuesta sólida (40-60 palabras)"
    }
  ]
}`
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, system: mod.system })
      })
      if (!res.ok) throw new Error('Error de servidor')
      const data = await res.json()
      setSteps(data.steps)
    } catch {
      setSteps(DEMO[modId])
    } finally {
      setLoading(false)
    }
  }

  async function evaluateOpen() {
    if (openAnswer.trim().length < 20) {
      setFeedback({ type: 'wrong', title: 'Escribe más', text: 'Tu análisis necesita al menos un par de oraciones para poder evaluarse.' })
      return
    }
    const step = steps[stepIndex]
    setLoading(true)
    setFeedback(null)

    try {
      const prompt = `El estudiante respondió lo siguiente a esta consigna:
CONSIGNA: ${step.question}
CRITERIOS: ${step.criteria}
RESPUESTA: ${openAnswer}

Evalúa con este JSON:
{"score": "high" | "medium" | "low", "feedback": "retroalimentación específica de 50-80 palabras"}`

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, system: 'Eres un tutor de ciencias sociales. Evalúa respuestas estudiantiles con rigor y generosidad. Responde SOLO con JSON válido.' })
      })
      const data = await res.json()
      const xpMap = { high: 20, medium: 12, low: 5 }
      const earned = xpMap[data.score] || 10
      setSessionXP(prev => prev + earned)
      if (data.score === 'high') setSessionCorrect(prev => prev + 1)
      const typeMap = { high: 'correct', medium: 'partial', low: 'wrong' }
      const labelMap = { high: `✓ Excelente +${earned} XP`, medium: `◎ En desarrollo +${earned} XP`, low: `○ Necesita más elaboración +${earned} XP` }
      setFeedback({ type: typeMap[data.score], title: labelMap[data.score], text: data.feedback, done: true })
    } catch {
      setSessionXP(prev => prev + 10)
      setFeedback({ type: 'partial', title: '◎ Respuesta registrada +10 XP', text: 'No se pudo conectar con el evaluador. Tu respuesta ha sido registrada.', done: true })
    } finally {
      setLoading(false)
    }
  }

  function checkMC() {
    if (selectedOption === null || answered) return
    const step = steps[stepIndex]
    const isCorrect = selectedOption === step.correct
    setAnswered(true)
    if (isCorrect) {
      setSessionXP(prev => prev + 15)
      setSessionCorrect(prev => prev + 1)
      setFeedback({ type: 'correct', title: '✓ Correcto +15 XP', text: step.explanation, done: true })
    } else {
      setFeedback({ type: 'wrong', title: '✗ No es correcto', text: step.explanation, done: true })
    }
  }

  function nextStep() {
    const next = stepIndex + 1
    if (next >= steps.length) {
      endLesson()
    } else {
      setStepIndex(next)
      setAnswered(false)
      setSelectedOption(null)
      setFeedback(null)
      setOpenAnswer('')
    }
  }

  function endLesson() {
    const mod = currentModule
    setXp(prev => prev + sessionXP)
    setStreak(prev => prev + 1)
    setProgress(prev => ({ ...prev, [mod]: Math.min(100, (prev[mod] || 0) + 35) }))
    setScreen('complete')
  }

  function goHome() {
    setScreen('home')
    setCurrentModule(null)
    setSteps([])
  }

  const step = steps[stepIndex]
  const lessonPct = steps.length ? (stepIndex / steps.length) * 100 : 0

  return (
    <>
      {/* ── HOME ── */}
      <div id="home" className={`screen${screen === 'home' ? ' active' : ''}`}>
        <div className="top-bar">
          <div className="logo">Socio<span>Lab</span></div>
          <div className="stats-row">
            <div className="stat-pill xp">⚡ {xp} XP</div>
            <div className="stat-pill streak">🔥 {streak}</div>
          </div>
        </div>

        <div className="welcome-block">
          <h1>Bienvenido,<br />estudiante</h1>
          <p>Elige un módulo para continuar</p>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: globalPct + '%' }} />
          </div>
          <div className="progress-label">
            <span>{xp} XP</span>
            <span>Nivel 1 — Aprendiz</span>
          </div>
        </div>

        <div className="section-title">Módulos</div>

        <div className="modules-grid">
          {Object.entries(MODULES).map(([id, mod]) => (
            <div key={id} className="module-card" onClick={() => startModule(id)}>
              <span className="m-icon">{mod.icon}</span>
              <div className="m-name">{mod.name}</div>
              <div className="m-lessons">{mod.authors}</div>
              <div className="m-bar">
                <div className="m-bar-fill" style={{ width: (progress[id] || 0) + '%', background: mod.color }} />
              </div>
            </div>
          ))}
          <div className="module-card locked">
            <span className="m-icon">🔬</span>
            <div className="m-name">Violencia y Estado</div>
            <div className="m-lessons">Mbembe · Wacquant</div>
            <div className="m-lock">🔒</div>
            <div className="m-bar"><div className="m-bar-fill" style={{ width: '0%' }} /></div>
          </div>
        </div>

        <button className="continue-btn" onClick={() => startModule('ant')}>
          Comenzar lección →
        </button>
      </div>

      {/* ── LESSON ── */}
      <div id="lesson" className={`screen${screen === 'lesson' ? ' active' : ''}`}>
        <div className="lesson-header">
          <button className="back-btn" onClick={goHome}>←</button>
          <div className="lesson-progress">
            <div className="lesson-progress-fill" style={{ width: lessonPct + '%' }} />
          </div>
          <div className="lesson-xp">+{sessionXP} XP</div>
        </div>

        <div className="lesson-body">
          {loading && !step && (
            <div className="loading-state">
              <div className="spinner" />
              Generando lección con IA...
            </div>
          )}

          {!loading && step && step.type === 'theory' && (
            <>
              <span className="phase-tag theory">📖 Teoría</span>
              <div className="lesson-question">{step.title}</div>
              <div className="theory-block" dangerouslySetInnerHTML={{ __html: step.content }} />
              <button className="action-btn primary" onClick={nextStep}>Continuar →</button>
            </>
          )}

          {!loading && step && step.type === 'multiple_choice' && (
            <>
              <span className="phase-tag practice">🎯 Práctica</span>
              <div className="lesson-question">{step.question}</div>
              <div className="options-list">
                {step.options.map((opt, i) => {
                  let cls = 'option-btn'
                  if (answered) {
                    if (i === step.correct) cls += ' correct'
                    else if (i === selectedOption) cls += ' wrong'
                  } else if (i === selectedOption) cls += ' selected'
                  return (
                    <button key={i} className={cls} disabled={answered}
                      onClick={() => { if (!answered) setSelectedOption(i) }}>
                      {opt}
                    </button>
                  )
                })}
              </div>
              {feedback && (
                <div className={`feedback-box ${feedback.type} show`}>
                  <div className="fb-title">{feedback.title}</div>
                  {feedback.text}
                </div>
              )}
              {!answered
                ? <button className="action-btn primary" disabled={selectedOption === null} onClick={checkMC}>Verificar</button>
                : <button className="action-btn next" onClick={nextStep}>Siguiente →</button>
              }
            </>
          )}

          {!loading && step && step.type === 'open' && (
            <>
              <span className="phase-tag case">🔍 Análisis de caso</span>
              <div className="lesson-question">{step.question}</div>
              <textarea className="open-input" value={openAnswer}
                onChange={e => setOpenAnswer(e.target.value)}
                placeholder="Escribe tu análisis aquí..."
                disabled={feedback?.done} />
              {feedback && (
                <div className={`feedback-box ${feedback.type} show`}>
                  <div className="fb-title">{feedback.title}</div>
                  {feedback.text}
                </div>
              )}
              {loading && <div className="loading-state"><div className="spinner" />Evaluando tu respuesta...</div>}
              {!feedback?.done && !loading && (
                <button className="action-btn primary" onClick={evaluateOpen}>Evaluar con IA</button>
              )}
              {feedback?.done && (
                <button className="action-btn next" onClick={nextStep}>Finalizar lección →</button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── COMPLETE ── */}
      <div id="complete" className={`screen${screen === 'complete' ? ' active' : ''}`}>
        <div className="complete-icon">🎯</div>
        <div className="complete-title">¡Lección completada!</div>
        <div className="complete-sub">
          {currentModule ? `Módulo: ${MODULES[currentModule]?.name}` : ''}
        </div>
        <div className="score-row">
          <div className="score-card">
            <span className="sc-val">{sessionXP}</span>
            <span className="sc-label">XP ganados</span>
          </div>
          <div className="score-card">
            <span className="sc-val">{sessionCorrect}/{steps.filter(s => s.type !== 'theory').length}</span>
            <span className="sc-label">Correctas</span>
          </div>
        </div>
        <button className="action-btn primary" style={{ maxWidth: 280 }} onClick={goHome}>
          Volver al inicio
        </button>
      </div>
    </>
  )
}

export default App
