const QuestionLayout = ({ title, children }) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      {children}
    </div>
  )
}

export default QuestionLayout
