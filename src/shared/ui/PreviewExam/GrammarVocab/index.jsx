import QuestionForm from "./grammar-question-form";
import { transformGrammarData } from "@shared/lib/utils/transformExcelDataToStructuredJSON";

const GrammarVocabPreview = ({ dataExam }) => {
  const dataGrammar = transformGrammarData(dataExam);

   if (!dataGrammar || !dataGrammar.Parts) {
    return <div>Loading Grammar & Vocabulary...</div>;
  }

  return (
    <>
      {dataGrammar.Parts.map((part, index) => (
        <div key={index}>
          {part.Questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="mt-6 bg-gray border border-slate-200 border-solid p-4 rounded-xl shadow-lg"
            >
              <div className="rounded-xl bg-[#003087] px-4 py-1 text-base font-semibold text-white my-6 w-fit">
                Questions {question.Sequence}
              </div>
              <QuestionForm
                currentPart={question}
                answers={question.AnswerContent.correctAnswer}
                setUserAnswer={() =>
                  console.log("setUserAnswer function not implemented")
                }
                onSubmit={() =>
                  console.log("onSubmit function not implemented")
                }
                questionNumber={question.Sequence}
              />
              
            </div>
          ))}
        </div>
      ))}
    </>
  );
};
export default GrammarVocabPreview;
