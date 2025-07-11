import { transformWritingData } from "@shared/lib/utils/transformExcelDataToStructuredJSON";
import QuestionForm from "./writing-question-form";
import { Typography, Card } from "antd";
const { Title } = Typography;

export const DEFAULT_MAX_WORDS = {
  1: null,
  2: 45,
  3: 60,
  4: [75, 225],
};

const WritingTest = ({ dataExam }) => {
  const dataWriting = transformWritingData(dataExam);

  return (
    <div className="relative mx-auto p-5">
      {dataWriting?.Parts?.map((part, index) => (
        <div key={index}>
          <Card className="mb-4">
            <div className="mb-4 flex w-full items-center justify-between">
              <Title level={4} className="text-l mb-5 font-semibold">
                Question {part.Sequence} of {dataWriting.Parts.length}
              </Title>
            </div>
            <QuestionForm
              currentPart={part}
              partNumber={part.Sequence}
              answers={{}}
              handleTextChange={null}
              countWords={0}
              wordCounts={0}
              DEFAULT_MAX_WORDS={DEFAULT_MAX_WORDS}
            />
          </Card>
        </div>
      ))}
    </div>
  );
};

export default WritingTest;
