import React, { useMemo } from 'react';
import { Card, Tag, Button, Typography, Avatar, Spin, Empty } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  InfoCircleFilled,
  FileTextFilled,
  AudioOutlined,
  CheckCircleFilled,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import HeaderInfo from '@app/components/HeaderInfo';
import { useGetQuestionDetail } from '@features/questions/hooks';
import { WRITING_PART_TYPES } from '@features/questions/constant/writingType';
import WritingPreview from './components/CreateSkills/Writing/WritingPreview';
import DropdownPreview from './components/CreateSkills/Reading/dropdown/DropdownPreview';
import MatchingPreview from './components/CreateSkills/Reading/matching/MatchingPreview';
import OrderingPreview from './components/CreateSkills/Reading/ordering/OrderingPreview';

const { Title, Text } = Typography;

// Helper parse JSON từ DB (string) -> object
const safeParseJson = (val) => {
  if (!val) return null;
  if (typeof val === 'object') return val;

  if (typeof val === 'string') {
    const trimmed = val.trim();

    // Nếu không bắt đầu bằng { hoặc [ → coi như plain text, không parse
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return val;
    }

    try {
      return JSON.parse(trimmed);
    } catch (e) {
      console.error('Cannot parse JSON:', val, e);
      return val; // trả lại nguyên string, tránh null
    }
  }

  return null;
};

// Map Type nội bộ -> label hiển thị
const mapQuestionTypeLabel = (skillName, type, answer) => {
  const t = type?.toLowerCase?.() || '';

  if (skillName === 'LISTENING') {
    if (t === 'listening-questions-group') return 'Listening – Question Group';
    if (t === 'dropdown-list') return 'Listening – Dropdown List';
    if (t === 'multiple-choice') return 'Listening – Multiple Choice';
  }

  if (skillName === 'GRAMMAR AND VOCABULARY') {
    if (t === 'matching') return 'Grammar – Matching';
    if (t === 'multiple-choice') return 'Grammar – Multiple Choice';
  }

  if (skillName === 'WRITING') {
    const partType = answer?.partType;
    if (partType === WRITING_PART_TYPES.PART1_SHORT_ANSWERS)
      return 'Writing – Part 1: Short Answers';
    if (partType === WRITING_PART_TYPES.PART2_FORM_FILLING)
      return 'Writing – Part 2: Form Filling';
    if (partType === WRITING_PART_TYPES.PART3_CHAT_ROOM)
      return 'Writing – Part 3: Chat Room';
    if (partType === WRITING_PART_TYPES.PART4_EMAIL_WRITING)
      return 'Writing – Part 4: Email Writing';
    return 'Writing';
  }

  // fallback
  return type || 'N/A';
};

const QuestionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // route: /questions/:id

  const { data, isLoading } = useGetQuestionDetail(id);

  const question = data || {}; // đảm bảo không bị undefined

  const answerContent = useMemo(
    () => safeParseJson(question.AnswerContent || question.answerContent),
    [question]
  );

  const groupContent = useMemo(
    () =>
      safeParseJson(
        question.GroupContent ||
          question.groupContent ||
          answerContent?.groupContent
      ),
    [question, answerContent]
  );

  const audioKey =
    question.AudioKeys

  const skillName = question.Part?.Skill?.Name;

  const partName =
    question.Part?.Content ||
    question.partName ||
    question.PartContent ||
    question.part ||
    'N/A';

  const type = question.Type || question.type;

  const createdByName =
    question.CreatedBy?.FullName ||
    question.creatorName ||
    question.CreatedByName ||
    '—';
  const updatedByName =
    question.UpdatedBy?.FullName ||
    question.updaterName ||
    question.UpdatedByName ||
    '—';

  const creatorAvatar =
    question.CreatedBy?.AvatarUrl || question.creatorAvatar || undefined;
  const updaterAvatar =
    question.UpdatedBy?.AvatarUrl || question.updaterAvatar || undefined;

  const createdAt =
    question.createdAt || question.CreatedAt || question.createdDate;
  const updatedAt =
    question.updatedAt || question.UpdatedAt || question.updatedDate;

  const createdDateText = createdAt
    ? new Date(createdAt).toLocaleString()
    : '—';
  const updatedDateText = updatedAt
    ? new Date(updatedAt).toLocaleString()
    : '—';

  const questionId = question.ID || question.id || id;
  const contentText = question.Content || question.content || '';
  const subContentText = question.SubContent || question.subContent;

  const typeLabel = mapQuestionTypeLabel(skillName, type, answerContent);

  // ----------------- RENDER PHẦN NỘI DUNG THEO SKILL + TYPE -----------------

  // Listening: multiple-choice
  const renderListeningMultipleChoice = () => {
    if (!answerContent) return null;
    const options =
      Array.isArray(answerContent.options) && answerContent.options.length
        ? answerContent.options
        : [];
    const correct = answerContent.correctAnswer;

    return (
      <>
        <Text className='text-[#111827] font-bold mb-4 block'>
          Answer Options
        </Text>
        <div className='space-y-3'>
          {options.map((optText, idx) => {
            const key = String.fromCharCode(65 + idx);
            const isCorrect = optText === correct;
            return (
              <div
                key={key}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  isCorrect
                    ? 'bg-[#F0FDF4] border-[#22AD5C]'
                    : 'bg-[#FAFAFA] border-transparent'
                }`}
              >
                <div className='flex items-center gap-4'>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      isCorrect
                        ? 'bg-[#22AD5C] text-white'
                        : 'bg-[#E5E7EB] text-gray-500'
                    }`}
                  >
                    {key}
                  </div>
                  <span
                    className={`font-medium ${
                      isCorrect ? 'text-[#111827]' : 'text-gray-600'
                    }`}
                  >
                    {optText}
                  </span>
                </div>
                {isCorrect && (
                  <CheckCircleFilled className='text-[#22AD5C] text-xl' />
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // Listening: dropdown-list (matching kiểu dropdown)
  const renderListeningDropdown = () => {
    if (!answerContent) return null;
    const {
      leftItems = [],
      rightItems = [],
      correctAnswer = [],
    } = answerContent;

    const findRightForLeft = (left) =>
      correctAnswer.find((c) => c.key === left)?.value ||
      correctAnswer.find((c) => c.left === left)?.right ||
      '';

    return (
      <div className='space-y-4'>
        <Text className='text-[#111827] font-bold block mb-2'>
          Sentences & Answers
        </Text>
        <div className='space-y-3'>
          {leftItems.map((sentence, idx) => {
            const correctRight = findRightForLeft(sentence);
            return (
              <div
                key={idx}
                className='border border-gray-200 rounded-lg p-3 bg-gray-50'
              >
                <p className='text-gray-900 mb-2 whitespace-pre-wrap'>
                  {idx + 1}. {sentence}
                </p>
                {correctRight && (
                  <Tag color='green' className='rounded-md'>
                    Correct: {correctRight}
                  </Tag>
                )}
              </div>
            );
          })}
        </div>

        {rightItems.length > 0 && (
          <div className='mt-4'>
            <Text className='font-semibold text-gray-800 mb-1 block'>
              Option bank
            </Text>
            <div className='flex flex-wrap gap-2'>
              {rightItems.map((r, i) => (
                <Tag key={i} className='bg-gray-50 border-gray-200'>
                  {r}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Listening: group (listening-questions-group)
  const renderListeningGroup = () => {
    const listContent =
      groupContent?.listContent || answerContent?.groupContent?.listContent;

    if (!listContent || !Array.isArray(listContent)) return null;

    return (
      <div className='space-y-4'>
        {listContent.map((q, idx) => (
          <div
            key={q.ID || idx}
            className='border border-gray-200 rounded-lg p-4 bg-gray-50'
          >
            <p className='font-semibold text-gray-800 mb-2'>
              {idx + 1}. {q.content}
            </p>
            <div className='space-y-2'>
              {(q.options || []).map((opt, i) => {
                const key = String.fromCharCode(65 + i);
                const isCorrect = opt === q.correctAnswer;
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${
                      isCorrect
                        ? 'bg-[#F0FDF4] border-[#22AD5C]'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <span className='w-6 text-xs font-bold text-blue-900'>
                        {key}.
                      </span>
                      <span
                        className={
                          isCorrect ? 'text-[#111827]' : 'text-gray-700'
                        }
                      >
                        {opt}
                      </span>
                    </div>
                    {isCorrect && (
                      <CheckCircleFilled className='text-[#22AD5C] text-base' />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListeningContent = () => {
    const t = type?.toLowerCase?.() || answerContent?.type?.toLowerCase?.();

    if (t === 'listening-questions-group') {
      return renderListeningGroup();
    }
    if (t === 'dropdown-list') {
      return renderListeningDropdown();
    }
    // default: multiple-choice
    return renderListeningMultipleChoice();
  };

  // Grammar & Vocabulary
  const renderGrammarContent = () => {
    if (!answerContent) return null;
    const t = type?.toLowerCase?.() || answerContent?.type?.toLowerCase?.();

    // Grammar multiple-choice: options: [{ key, value }], correctAnswer = text
    if (t === 'multiple-choice') {
      const options = answerContent.options || [];
      const correct = answerContent.correctAnswer;

      return (
        <>
          <Text className='text-[#111827] font-bold mb-4 block'>
            Answer Options
          </Text>
          <div className='space-y-3'>
            {options.map((opt, idx) => {
              const key = opt.key || String.fromCharCode(65 + idx);
              const text = opt.value || '';
              const isCorrect = text === correct;
              return (
                <div
                  key={key}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    isCorrect
                      ? 'bg-[#F0FDF4] border-[#22AD5C]'
                      : 'bg-[#FAFAFA] border-transparent'
                  }`}
                >
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isCorrect
                          ? 'bg-[#22AD5C] text-white'
                          : 'bg-[#E5E7EB] text-gray-500'
                      }`}
                    >
                      {key}
                    </div>
                    <span
                      className={`font-medium ${
                        isCorrect ? 'text-[#111827]' : 'text-gray-600'
                      }`}
                    >
                      {text}
                    </span>
                  </div>
                  {isCorrect && (
                    <CheckCircleFilled className='text-[#22AD5C] text-xl' />
                  )}
                </div>
              );
            })}
          </div>
        </>
      );
    }

    // Grammar matching: leftItems[], rightItems[], correctAnswer[{left,right}]
    if (t === 'matching') {
      const {
        leftItems = [],
        rightItems = [],
        correctAnswer = [],
      } = answerContent;

      const findRight = (left) =>
        correctAnswer.find((x) => x.left === left)?.right ||
        correctAnswer.find((x) => x.key === left)?.value ||
        '';

      return (
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <Text className='font-semibold text-gray-800 mb-2 block'>
                Left items
              </Text>
              <div className='space-y-2'>
                {leftItems.map((item, idx) => (
                  <div
                    key={idx}
                    className='flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2'
                  >
                    <span className='font-bold text-blue-900 w-5'>
                      {idx + 1}
                    </span>
                    <span className='text-gray-900'>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Text className='font-semibold text-gray-800 mb-2 block'>
                Right items
              </Text>
              <div className='flex flex-wrap gap-2'>
                {rightItems.map((item, idx) => (
                  <Tag
                    key={idx}
                    className='bg-gray-50 border-gray-200 rounded-md'
                  >
                    {item}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Text className='font-semibold text-gray-800 mb-2 block'>
              Correct matching
            </Text>
            <div className='space-y-2'>
              {leftItems.map((l, idx) => {
                const r = findRight(l);
                if (!r) return null;
                return (
                  <div
                    key={idx}
                    className='flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 bg-white text-sm'
                  >
                    <span className='font-bold text-blue-900'>{idx + 1}</span>
                    <span className='mx-1'>→</span>
                    <span className='font-semibold text-green-700'>{r}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return <Empty description='Unsupported grammar type' />;
  };

  // Writing – dùng lại WritingPreview (đã support wordLimit)
  const renderWritingContent = () => {
    if (!answerContent) {
      // legacy WRITING: Content = câu hỏi, GroupContent = email / passage
      const emailOrPassage =
        typeof groupContent === 'string'
          ? groupContent
          : groupContent?.body || '';

      return (
        <div className='space-y-3'>
          {/* Câu hỏi / yêu cầu viết */}
          <Text className='font-medium text-gray-900 whitespace-pre-wrap'>
            {contentText}
          </Text>

          {/* Email / đoạn văn gốc (GroupContent) */}
          {emailOrPassage && (
            <div className='mt-3 bg-white border border-gray-200 rounded-md p-4'>
              <Text className='text-gray-800 whitespace-pre-wrap'>
                {emailOrPassage}
              </Text>
            </div>
          )}

          {subContentText && (
            <Text className='text-gray-600 whitespace-pre-wrap'>
              {subContentText}
            </Text>
          )}

          <Text type='secondary' className='block mt-2'>
            (This writing question has no structured AnswerContent yet.)
          </Text>
        </div>
      );
    }

    // ... phần có AnswerContent giữ nguyên
    const partType =
      answerContent.partType ||
      answerContent.writingType ||
      WRITING_PART_TYPES.PART1_SHORT_ANSWERS;

    const writingData =
      answerContent.data ||
      answerContent.part1 ||
      answerContent.part2 ||
      answerContent.part3 ||
      answerContent.part4 ||
      answerContent;

    return <WritingPreview partType={partType} data={writingData} />;
  };

  const renderReadingContent = () => {
    if (!answerContent) {
      // fallback: hiển thị content thô + JSON
      return (
        <div className='space-y-3'>
          <Text className='font-medium text-gray-900 whitespace-pre-wrap'>
            {contentText}
          </Text>
          {subContentText && (
            <Text className='text-gray-600 whitespace-pre-wrap'>
              {subContentText}
            </Text>
          )}
          {answerContent && (
            <pre className='mt-3 text-xs bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto'>
              {JSON.stringify(answerContent, null, 2)}
            </pre>
          )}
        </div>
      );
    }

    const t =
      type?.toLowerCase?.() || answerContent?.type?.toLowerCase?.() || '';

    // 🔹 1) READING – DROPDOWN-LIST
    if (t === 'dropdown-list') {
      const rawOptions = Array.isArray(answerContent.options)
        ? answerContent.options
        : [];
      const rawCorrect = Array.isArray(answerContent.correctAnswer)
        ? answerContent.correctAnswer
        : [];

      // build blanks: [{ key, options: [{id, value}], correctAnswer }]
      const blanks = rawOptions.map((opt) => {
        const key = String(opt.key);
        const values = Array.isArray(opt.value) ? opt.value : [];

        const options = values.map((text, idx) => ({
          id: `${key}-${idx}`,
          value: text,
        }));

        const correct = rawCorrect.find((c) => String(c.key) === key);
        let correctAnswerId;

        if (correct) {
          const idx = values.findIndex((v) => v === correct.value);
          if (idx !== -1) {
            correctAnswerId = `${key}-${idx}`;
          }
        }

        return {
          key,
          options,
          correctAnswer: correctAnswerId,
        };
      });

      return (
        <div className='space-y-4'>
          <DropdownPreview
            content={answerContent.content || contentText || ''}
            blanks={blanks}
          />
        </div>
      );
    }

    // 🔹 2) READING – MATCHING
    if (t === 'matching') {
      const rawLeftItems = Array.isArray(answerContent.leftItems)
        ? answerContent.leftItems
        : [];
      const rawRightItems = Array.isArray(answerContent.rightItems)
        ? answerContent.rightItems
        : [];
      const rawCorrect = Array.isArray(answerContent.correctAnswer)
        ? answerContent.correctAnswer
        : [];

      const leftItems = rawLeftItems.map((text, index) => ({
        id: `L${index + 1}`,
        text,
      }));

      const rightItems = rawRightItems.map((text, index) => ({
        id: `R${index + 1}`,
        text,
      }));

      const mapping = rawCorrect
        .map(({ left, right }) => {
          const leftIndex = rawLeftItems.findIndex((item) => item === left);
          const rightObj = rightItems.find((item) => item.text === right);
          if (leftIndex === -1 || !rightObj) return null;

          return {
            leftIndex,
            rightId: rightObj.id,
          };
        })
        .filter(Boolean);

      return (
        <MatchingPreview
          content={answerContent.content || contentText || ''}
          leftItems={leftItems}
          rightItems={rightItems}
          mapping={mapping}
          onChange={null}
        />
      );
    }

    if (t === 'ordering') {
      const rawOptions = Array.isArray(answerContent.options)
        ? answerContent.options
        : [];
      const rawCorrect = Array.isArray(answerContent.correctAnswer)
        ? answerContent.correctAnswer
        : [];

      // 1) Build items cho OrderingPreview
      const items = rawOptions.map((text, index) => ({
        id: `item-${index + 1}`,
        text,
      }));

      // 2) Build initialPositions: { [itemId]: slotIndex }
      //    slotIndex = correct position (0-based)
      const initialPositions = {};

      items.forEach((item, idx) => {
        const ans = rawCorrect[idx]; // cùng index với options
        if (ans && typeof ans.value === 'number') {
          initialPositions[item.id] = ans.value - 1; // 1-based -> 0-based
        } else {
          initialPositions[item.id] = 'pool'; // fallback
        }
      });

      return (
        <div className='space-y-4'>
          {/* Optional: instruction / content gốc */}
          {answerContent.content && (
            <Text className='block text-gray-700 whitespace-pre-wrap'>
              {answerContent.content}
            </Text>
          )}

          <OrderingPreview items={items} initialPositions={initialPositions} />
        </div>
      );
    }

    // 🔹 fallback cho type chưa support
    return (
      <div className='space-y-3'>
        <Text className='font-medium text-gray-900 whitespace-pre-wrap'>
          {contentText}
        </Text>
        {subContentText && (
          <Text className='text-gray-600 whitespace-pre-wrap'>
            {subContentText}
          </Text>
        )}
        {answerContent && (
          <pre className='mt-3 text-xs bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto'>
            {JSON.stringify(answerContent, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  const renderQuestionContentSection = () => {
    if (!skillName) {
      return (
        <Text type='secondary'>
          No skill information. Cannot render specific preview.
        </Text>
      );
    }

    if (skillName === 'LISTENING') {
      return renderListeningContent();
    }

    if (skillName === 'GRAMMAR AND VOCABULARY') {
      return renderGrammarContent();
    }

    if (skillName === 'WRITING') {
      return renderWritingContent();
    }

    if (skillName === 'READING') {
      return renderReadingContent();
    }

    // fallback cho các skill khác (Reading, Grammar khác, ...)
    return (
      <div className='space-y-3'>
        <Text className='font-medium text-gray-900 whitespace-pre-wrap'>
          {contentText}
        </Text>
        {subContentText && (
          <Text className='text-gray-600 whitespace-pre-wrap'>
            {subContentText}
          </Text>
        )}
        {answerContent && (
          <pre className='mt-3 text-xs bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto'>
            {JSON.stringify(answerContent, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  // ----------------- LOADING / EMPTY -----------------
  if (isLoading) {
    return (
      <div className='w-full flex justify-center items-center h-[60vh]'>
        <Spin size='large' />
      </div>
    );
  }

  if (!question || !questionId) {
    return (
      <div className='w-full flex justify-center items-center h-[60vh]'>
        <Empty description='Question not found' />
      </div>
    );
  }

  return (
    <>
      <HeaderInfo
        title='Question Information'
        subtitle='View detailed information about this question.'
      />

      <div className='min-h-screen bg-[#F9F9F9] p-6'>
        {/* --- General Information Card --- */}
        <Card className='mb-6 rounded-xl shadow-sm border border-gray-100'>
          <div className='flex items-center gap-2 mb-6'>
            <InfoCircleFilled className='text-[#003087] text-xl' />
            <Title level={4} className='!m-0 text-[#111827]'>
              General Information
            </Title>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6'>
            {/* Left Column */}
            <div className='space-y-6'>
              <div>
                <Text className='block text-gray-500 text-sm mb-1'>
                  Question ID
                </Text>
                <Text className='font-bold text-[#111827]'>{questionId}</Text>
              </div>
              <div>
                <Text className='block text-gray-500 text-sm mb-1'>
                  Question Name
                </Text>
                <Text className='font-bold text-[#111827]'>
                  {subContentText || contentText || '—'}
                </Text>
              </div>
              <div>
                <Text className='block text-gray-500 text-sm mb-1'>
                  Question Type
                </Text>
                <Text className='font-bold text-[#111827]'>{typeLabel}</Text>
              </div>
              <div>
                <Text className='block text-gray-500 text-sm mb-1'>
                  Updater
                </Text>
                <div className='flex items-center gap-2'>
                  <Avatar
                    src={updaterAvatar}
                    size='small'
                    icon={<UserOutlined />}
                  />
                  <Text className='font-bold text-[#111827]'>
                    {updatedByName}
                  </Text>
                </div>
              </div>
              <div>
                <Text className='block text-gray-500 text-sm mb-1'>
                  Updated Date
                </Text>
                <div className='flex items-center gap-2 text-[#111827] font-bold'>
                  <CalendarOutlined className='text-gray-400' />
                  {updatedDateText}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className='space-y-6'>
              <div>
                <Text className='block text-gray-500 text-sm mb-1'>Skill</Text>
                <Tag
                  color='blue'
                  className='px-3 py-1 rounded-md bg-blue-50 text-blue-700 border-none font-medium flex w-fit items-center gap-2'
                >
                  {skillName === 'LISTENING' && <AudioOutlined />}
                  {skillName || 'N/A'}
                </Tag>
              </div>
              <div>
                <Text className='block text-gray-500 text-sm mb-1'>Part</Text>
                <Text className='text-gray-500'>{partName}</Text>
              </div>
              <div>
                <Text className='block text-gray-500 text-sm mb-1'>
                  Creator
                </Text>
                <div className='flex items-center gap-2'>
                  <Avatar
                    src={creatorAvatar}
                    size='small'
                    icon={<UserOutlined />}
                  />
                  <Text className='font-bold text-[#111827]'>
                    {createdByName}
                  </Text>
                </div>
              </div>
              <div>
                <Text className='block text-gray-500 text-sm mb-1'>
                  Created Date
                </Text>
                <div className='flex items-center gap-2 text-[#111827] font-bold'>
                  <CalendarOutlined className='text-gray-400' />
                  {createdDateText}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* --- Question Content Card --- */}
        <Card className='rounded-xl shadow-sm border border-gray-100 mb-10'>
          <div className='flex items-center gap-2 mb-6'>
            <FileTextFilled className='text-[#003087] text-xl' />
            <Title level={4} className='!m-0 text-[#111827]'>
              Question Content
            </Title>
          </div>

          {/* Content Box (stem) */}
          <div className='bg-[#FAFAFA] border border-gray-200 rounded-lg p-6 mb-6'>
            <Text className='text-[#111827] text-base font-medium whitespace-pre-wrap'>
              {contentText || 'Question stem / instruction...'}
            </Text>
            {subContentText && (
              <p className='mt-2 text-gray-600 whitespace-pre-wrap'>
                {subContentText}
              </p>
            )}
            {audioKey && (
              <div className='mt-4 flex items-center gap-3'>
                <AudioOutlined className='text-[#003087] text-lg' />
                <audio controls src={audioKey} className='w-full'>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>

          {/* Answer / Detail by Type */}
          {renderQuestionContentSection()}
        </Card>

        {/* --- Footer Buttons --- */}
        <div className='flex justify-center gap-4 pb-10'>
          <Button
            size='large'
            icon={<ArrowLeftOutlined />}
            className='bg-gray-100 border-none text-gray-700 hover:bg-gray-200 rounded-lg px-6 h-[48px] font-medium'
            onClick={() => navigate('/questions')}
          >
            Back to Question List
          </Button>
          <Button
            type='primary'
            size='large'
            icon={<EditOutlined />}
            className='bg-[#003087] hover:bg-[#002566] rounded-lg px-6 h-[48px] font-medium'
            onClick={() => navigate(`/questions/${questionId}/edit`)}
          >
            Edit Question
          </Button>
        </div>
      </div>
    </>
  );
};

export default QuestionDetail;
