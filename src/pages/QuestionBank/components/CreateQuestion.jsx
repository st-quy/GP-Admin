import { useParams } from "react-router-dom"
import QuestionLayout from "./QuestionLayout"
import CreateListening from "./CreateSkills/CreateListening"
import CreateGrammarVocab from "./CreateSkills/CreateGrammarVocab"
import CreateSpeaking from "./CreateSkills/CreateSpeaking"
import CreateWriting from "./CreateSkills/CreateWriting"
import CreateReading from "./CreateSkills/CreateReading"

const PAGE_COMPONENT = {
  "create-listening": {
    title: "Create Listening Questions",
    component: <CreateListening />,
  },
  "create-reading": {
    title: "Create Reading Questions",
    component: <CreateReading />,
  },
    "create-grammar-vocab": {
    title: "Create Grammar Vocab Questions",
    component: <CreateGrammarVocab />,
  },
    "create-speaking": {
    title: "Create Speaking Questions",
    component: <CreateSpeaking />,
  },
    "create-writing": {
    title: "Create Writing Questions",
    component: <CreateWriting />,
  },
  
  
}

const CreateQuestion = () => {
  const { type } = useParams()

  const page = PAGE_COMPONENT[type]

  if (!page) return <h1 className="text-red-500">Page not found</h1>

  return (
    <QuestionLayout title={page.title}>
      {page.component}
    </QuestionLayout>
  )
}

export default CreateQuestion
