import { useEffect, useMemo, useState } from 'react'
import { subjects } from './data/questions'

const STORAGE_KEY = 'elementary-quiz-system'

const initialState = {
  screen: 'subjects',
  subjectId: null,
  quizId: null,
  currentIndex: 0,
  answers: [],
}

function getSubject(subjectId) {
  return subjects.find((subject) => subject.id === subjectId)
}

function getQuiz(subjectId, quizId) {
  return getSubject(subjectId)?.quizzes.find((quiz) => quiz.id === quizId)
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved || !Array.isArray(saved.answers)) return initialState

    const validScreens = ['subjects', 'quizList', 'intro', 'quiz', 'result']
    const selectedQuiz = getQuiz(saved.subjectId, saved.quizId)
    const needsQuiz = ['intro', 'quiz', 'result'].includes(saved.screen)

    if (
      !validScreens.includes(saved.screen) ||
      (saved.screen === 'quizList' && !getSubject(saved.subjectId)) ||
      (needsQuiz && !selectedQuiz)
    ) {
      return initialState
    }

    return {
      ...initialState,
      ...saved,
      currentIndex:
        selectedQuiz && saved.currentIndex < selectedQuiz.questions.length
          ? saved.currentIndex
          : 0,
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return initialState
  }
}

function App() {
  const [state, setState] = useState(loadState)
  const subject = getSubject(state.subjectId)
  const selectedQuiz = getQuiz(state.subjectId, state.quizId)
  const questions = selectedQuiz?.questions ?? []
  const currentQuestion = questions[state.currentIndex]
  const currentAnswer = state.answers[state.currentIndex]

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const result = useMemo(() => {
    const correct = state.answers.filter((answer) => answer?.isCorrect).length
    const wrongAnswers = state.answers
      .map((answer, index) => ({ ...answer, question: questions[index] }))
      .filter((answer) => answer.selected && !answer.isCorrect)

    return {
      correct,
      incorrect: questions.length - correct,
      score: questions.length
        ? Math.round((correct / questions.length) * 100)
        : 0,
      wrongAnswers,
    }
  }, [questions, state.answers])

  function showSubjects() {
    setState(initialState)
  }

  function showQuizList(subjectId) {
    setState({
      ...initialState,
      screen: 'quizList',
      subjectId,
    })
  }

  function showQuizIntro(quizId) {
    setState({
      ...initialState,
      screen: 'intro',
      subjectId: state.subjectId,
      quizId,
    })
  }

  function startQuiz() {
    setState({
      ...state,
      screen: 'quiz',
      currentIndex: 0,
      answers: [],
    })
  }

  function selectAnswer(selected) {
    if (currentAnswer) return

    const answers = [...state.answers]
    answers[state.currentIndex] = {
      selected,
      isCorrect: selected === currentQuestion.answer,
    }
    setState({ ...state, answers })
  }

  function nextQuestion() {
    if (state.currentIndex === questions.length - 1) {
      setState({ ...state, screen: 'result' })
      return
    }

    setState({ ...state, currentIndex: state.currentIndex + 1 })
  }

  if (state.screen === 'subjects') {
    return (
      <main className="app-shell page-shell">
        <section className="home-heading">
          <div className="site-mark" aria-hidden="true">學</div>
          <div>
            <span className="eyebrow">國小自主練習</span>
            <h1>國小測驗系統</h1>
            <p>請先選擇科目，再挑選今天要練習的測驗範圍。</p>
          </div>
        </section>

        <section className="subject-grid" aria-label="科目列表">
          {subjects.map((item) => (
            <button
              className={`card subject-card subject-${item.id}`}
              key={item.id}
              onClick={() => showQuizList(item.id)}
            >
              <span className="subject-icon" aria-hidden="true">{item.icon}</span>
              <span className="subject-name">{item.name}</span>
              <span className="subject-description">{item.description}</span>
              <span className="subject-count">
                {item.quizzes.length
                  ? `${item.quizzes.length} 份測驗`
                  : '尚未新增測驗'}
              </span>
            </button>
          ))}
        </section>
      </main>
    )
  }

  if (state.screen === 'quizList') {
    return (
      <main className="app-shell page-shell">
        <nav className="top-nav">
          <button className="back-button" onClick={showSubjects}>
            ← 返回科目
          </button>
        </nav>

        <section className="list-heading">
          <span className={`subject-icon large subject-${subject.id}`}>
            {subject.icon}
          </span>
          <div>
            <span className="eyebrow">選擇測驗範圍</span>
            <h1>{subject.name}</h1>
            <p>{subject.description}</p>
          </div>
        </section>

        {subject.quizzes.length ? (
          <section className="quiz-list">
            {subject.quizzes.map((quiz) => (
              <button
                className="card quiz-list-card"
                key={quiz.id}
                onClick={() => showQuizIntro(quiz.id)}
              >
                <div>
                  <span className="unit-label">{quiz.range}</span>
                  <h2>{quiz.title}</h2>
                  <p>{quiz.description}</p>
                </div>
                <div className="quiz-card-meta">
                  <span>{quiz.questions.length} 題</span>
                  <span className="enter-arrow">→</span>
                </div>
              </button>
            ))}
          </section>
        ) : (
          <section className="card empty-state">
            <span aria-hidden="true">＋</span>
            <h2>這個科目還沒有測驗</h2>
            <p>之後提供測驗範圍與題目需求，就可以繼續加入。</p>
          </section>
        )}
      </main>
    )
  }

  if (state.screen === 'intro') {
    return (
      <main className="app-shell">
        <section className="card welcome-card">
          <button
            className="corner-back"
            onClick={() => showQuizList(subject.id)}
          >
            ← 返回
          </button>
          <div className="subject-badge">{subject.name}</div>
          <div className="book-stack" aria-hidden="true">
            <span>{subject.icon}</span>
          </div>
          <h1>{selectedQuiz.title}</h1>
          <p className="intro">{selectedQuiz.instructions}</p>
          <div className="quiz-info">
            <span>{questions.length} 題</span>
            <span>每題 4 個選項</span>
            <span>即時訂正</span>
          </div>
          <button className="primary-button" onClick={startQuiz}>
            開始測驗
          </button>
        </section>
      </main>
    )
  }

  if (state.screen === 'result') {
    return (
      <main className="app-shell result-shell">
        <section className="card result-card">
          <div className="subject-badge">{subject.name}測驗完成</div>
          <h1>做得很好！</h1>
          <p className="result-title">{selectedQuiz.title}</p>
          <div className="score-circle">
            <strong>{result.score}</strong>
            <span>總分</span>
          </div>
          <div className="result-grid">
            <div><strong>{result.correct}</strong><span>答對題數</span></div>
            <div><strong>{result.incorrect}</strong><span>答錯題數</span></div>
            <div><strong>{result.score}%</strong><span>正確率</span></div>
          </div>
          <div className="result-actions">
            <button className="secondary-button" onClick={showSubjects}>
              回科目首頁
            </button>
            <button className="primary-button" onClick={startQuiz}>
              重新測驗
            </button>
          </div>
        </section>

        <section className="review-section">
          <h2>錯題複習</h2>
          {result.wrongAnswers.length === 0 ? (
            <div className="card perfect-card">全部答對，太棒了！</div>
          ) : (
            <div className="review-list">
              {result.wrongAnswers.map(({ question, selected }) => (
                <article className="card review-card" key={question.id}>
                  <span className="review-number">第 {question.id} 題</span>
                  <h3>{question.question}</h3>
                  <p className="wrong-text">學生答案：{selected}</p>
                  <p className="correct-text">正確答案：{question.answer}</p>
                  <p className="hint">中文提示：{question.hint}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    )
  }

  const progress = ((state.currentIndex + 1) / questions.length) * 100

  return (
    <main className="app-shell">
      <section className="quiz-container">
        <header className="quiz-header">
          <div>
            <span className="mini-label">
              {subject.name}｜{selectedQuiz.shortTitle}
            </span>
            <strong>第 {state.currentIndex + 1} / {questions.length} 題</strong>
          </div>
          <span className="answered-count">答對 {result.correct} 題</span>
        </header>
        <div className="progress-track" aria-label="測驗進度">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <section className="card question-card">
          <p className="question-label">請選出正確答案</p>
          <h1>{currentQuestion.question}</h1>
          <div className="options-grid">
            {currentQuestion.options.map((option, index) => {
              let className = 'option-button'
              if (currentAnswer) {
                if (option === currentQuestion.answer) className += ' correct'
                else if (option === currentAnswer.selected) className += ' wrong'
                else className += ' muted'
              }

              return (
                <button
                  className={className}
                  disabled={Boolean(currentAnswer)}
                  key={option}
                  onClick={() => selectAnswer(option)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option}
                </button>
              )
            })}
          </div>

          {currentAnswer && (
            <div
              className={`feedback ${currentAnswer.isCorrect ? 'success' : 'error'}`}
              role="status"
            >
              <strong>
                {currentAnswer.isCorrect
                  ? '答對了！'
                  : `答錯了，正確答案是：${currentQuestion.answer}`}
              </strong>
              <p>{currentQuestion.hint}</p>
            </div>
          )}

          {currentAnswer && (
            <button className="next-button" onClick={nextQuestion}>
              {state.currentIndex === questions.length - 1
                ? '查看成績'
                : '下一題'}
            </button>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
