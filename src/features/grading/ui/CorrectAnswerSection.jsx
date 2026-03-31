import { Collapse, Tag } from "antd";
import {
  CheckCircleFilled,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useMemo } from "react";

const formatCorrectAnswer = (answerContent, questionType) => {
  if (!answerContent) return null;

  try {
    const parsed =
      typeof answerContent === "string"
        ? JSON.parse(answerContent)
        : answerContent;

    // Multiple choice - can be array or object
    if (questionType === "multiple-choice") {
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-1">
            <Tag color="green" className="font-medium">
              {item.correctAnswer || "N/A"}
            </Tag>
          </div>
        ));
      }
      if (parsed.correctAnswer) {
        return (
          <Tag color="green" className="font-medium">
            {typeof parsed.correctAnswer === "string"
              ? parsed.correctAnswer
              : parsed.correctAnswer?.value || JSON.stringify(parsed.correctAnswer)}
          </Tag>
        );
      }
    }

    // Matching type
    if (questionType === "matching") {
      const answers = Array.isArray(parsed)
        ? parsed[0]?.correctAnswers
        : parsed.correctAnswers;
      if (answers && Array.isArray(answers)) {
        return (
          <div className="flex flex-col gap-1">
            {answers.map((pair, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-gray-600 text-sm truncate max-w-[60%]">
                  {pair.left}
                </span>
                <span className="text-gray-400">&rarr;</span>
                <Tag color="green" className="font-medium">
                  {pair.right}
                </Tag>
              </div>
            ))}
          </div>
        );
      }
    }

    // Ordering type
    if (questionType === "ordering") {
      const correctOrder = parsed.correctAnswer || parsed;
      if (Array.isArray(correctOrder)) {
        const sorted = [...correctOrder].sort(
          (a, b) => (a.value || 0) - (b.value || 0)
        );
        return (
          <ol className="list-decimal list-inside flex flex-col gap-1 m-0 pl-0">
            {sorted.map((item, idx) => (
              <li key={idx} className="text-sm">
                {item.key}
              </li>
            ))}
          </ol>
        );
      }
    }

    // Dropdown list type
    if (questionType === "dropdown-list") {
      const answers = parsed.correctAnswer;
      if (Array.isArray(answers)) {
        return (
          <div className="flex flex-col gap-1">
            {answers.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-gray-600 text-sm truncate max-w-[60%]">
                  {item.key}
                </span>
                <span className="text-gray-400">&rarr;</span>
                <Tag color="green" className="font-medium">
                  {item.value}
                </Tag>
              </div>
            ))}
          </div>
        );
      }
    }

    // Fallback for other types
    if (parsed.correctAnswer) {
      const val = parsed.correctAnswer;
      if (typeof val === "string") {
        return <Tag color="green">{val}</Tag>;
      }
      if (Array.isArray(val)) {
        return val.map((v, idx) => (
          <Tag key={idx} color="green" className="mb-1">
            {typeof v === "string" ? v : JSON.stringify(v)}
          </Tag>
        ));
      }
    }

    return null;
  } catch {
    return null;
  }
};

const CorrectAnswerSection = ({ answerContent, questionType, subContent }) => {
  const correctAnswerDisplay = useMemo(
    () => formatCorrectAnswer(answerContent, questionType),
    [answerContent, questionType]
  );

  const hasCorrectAnswer = correctAnswerDisplay !== null;
  const hasExplanation = subContent && subContent.trim().length > 0;

  if (!hasCorrectAnswer && !hasExplanation) return null;

  const items = [];

  if (hasCorrectAnswer) {
    items.push({
      key: "correct-answer",
      label: (
        <span className="flex items-center gap-2 font-semibold text-[#003087]">
          <CheckCircleFilled className="text-green-600" />
          Correct Answer
        </span>
      ),
      children: <div className="py-1">{correctAnswerDisplay}</div>,
    });
  }

  if (hasExplanation) {
    items.push({
      key: "explanation",
      label: (
        <span className="flex items-center gap-2 font-semibold text-[#003087]">
          <FileTextOutlined className="text-blue-600" />
          Explanation
        </span>
      ),
      children: (
        <div className="py-1 text-sm text-gray-700 whitespace-pre-line">
          {subContent}
        </div>
      ),
    });
  }

  if (hasCorrectAnswer && hasExplanation) {
    items.push({
      key: "reference",
      label: (
        <span className="flex items-center gap-2 font-semibold text-[#003087]">
          <BookOutlined className="text-orange-500" />
          Reference Materials
        </span>
      ),
      children: (
        <div className="py-1 text-sm text-gray-500 italic">
          Refer to the explanation and correct answer above for review.
        </div>
      ),
    });
  }

  return (
    <div className="border-t border-gray-200">
      <Collapse
        ghost
        expandIconPosition="end"
        items={items}
        className="correct-answer-collapse"
      />
    </div>
  );
};

export default CorrectAnswerSection;
