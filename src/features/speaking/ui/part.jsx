import { useNavigate } from 'react-router-dom'
import PartIntro from '@features/speaking/ui/part-intro'
import QuestionDisplay from '@features/speaking/ui/question-display'
import { useEffect, useRef, useState } from 'react'

const Part = ({ data, onNextPart }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showIntro, setShowIntro] = useState(true)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const buttonRef = useRef(null)

  const navigate = useNavigate()
  const isPart4 = data.Sequence === 4

  const questions = (data.Questions || []).sort((a, b) => a.Sequence - b.Sequence)
  const totalQuestions = questions.length
  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    setShowIntro(true)
    setCurrentQuestionIndex(0)
  }, [data.Content, data.TopicID])

  const handleStartPart = () => {
    setShowIntro(false)
  }

  const handleNextQuestion = () => {
    setIsButtonLoading(true)
    setCurrentQuestionIndex(prev => prev + 1)
    setIsButtonLoading(false)
  }

  const handleNextPartInternal = () => {
    if (isPart4) {
      // ⬇️ Go to Listening after Part 4
      navigate('/listening')
      return
    }

    // ⬇️ Normal flow for Part 1–3
    if (onNextPart) {
      onNextPart()
    }
  }

  if (showIntro) {
    return <PartIntro data={data} onStartPart={handleStartPart} />
  }

  return (
    <div className="flex min-h-screen w-full flex-col rounded-xl bg-white">
      <QuestionDisplay
        data={data}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        onNextQuestion={handleNextQuestion}
        onNextPart={handleNextPartInternal}
        isLastQuestion={currentQuestionIndex === totalQuestions - 1}
        showNavigation={true}
        isPart4={isPart4}
        isUploading={false}
        isButtonLoading={isButtonLoading}
        buttonRef={buttonRef}
      />
    </div>
  )
}

export default Part
