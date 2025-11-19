import { useLocation, useParams } from "react-router-dom"
import QuestionLayout from "./QuestionLayout"
import CreateListening from "./CreateSkills/CreateListening"
import CreateGrammarVocab from "./CreateSkills/CreateGrammarVocab"
import CreateSpeaking from "./CreateSkills/CreateSpeaking"
import CreateWriting from "./CreateSkills/CreateWriting"
import CreateReading from "./CreateSkills/CreateReading"

const PAGE_COMPONENT = {
  "speaking": {
    title: "Create Listening Questions",
    component: <CreateListening />,
  },
  "reading": {
    title: "Create Reading Questions",
    component: <CreateReading />,
  },
    "grammar": {
    title: "Create Grammar Vocab Questions",
    component: <CreateGrammarVocab />,
  },
    "writing": {
    title: "Create Writing Questions",
    component: <CreateWriting />,
  },
      "listening": {
    title: "Create Listening Questions",
    component: <CreateListening/>,
  },
  
  
}

const CreateQuestion = () => {
  const location = useLocation()
  const skill = location.pathname.slice(location.pathname.lastIndexOf('/') + 1);

  const page = PAGE_COMPONENT[skill]

  if (!page) return <h1 className="text-red-500">Page not found</h1>

  return (
    <QuestionLayout title={page.title}>
      {page.component}
    </QuestionLayout>
  )
}

export default CreateQuestion
