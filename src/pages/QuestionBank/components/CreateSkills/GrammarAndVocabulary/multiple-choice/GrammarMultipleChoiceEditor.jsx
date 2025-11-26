// GrammarMultipleChoiceEditor.jsx
import React from 'react';
import {
  Input,
  Radio,
  Button,
  Typography,
  Space,
  Row,
  Col,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const GrammarMultipleChoiceEditor = ({
  questionText,
  setQuestionText,
  options,
  setOptions,
}) => {
  // đảm bảo luôn có ít nhất 2 options
  const addOption = () => {
    if (options.length >= LETTERS.length) {
      message.warning('Reached maximum options.');
      return;
    }

    setOptions((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: LETTERS[prev.length] || `Opt${prev.length + 1}`,
        value: '',
        isCorrect: false,
      },
    ]);
  };

  const updateOptionText = (id, text) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, value: text } : opt))
    );
  };

  const removeOption = (id) => {
    if (options.length <= 2) {
      message.warning('At least 2 options are required.');
      return;
    }

    const filtered = options.filter((opt) => opt.id !== id);

    // re-label lại A,B,C,... cho đẹp
    const relabeled = filtered.map((opt, idx) => ({
      ...opt,
      label: LETTERS[idx] || opt.label,
    }));

    setOptions(relabeled);
  };

  const setCorrectOption = (id) => {
    setOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        isCorrect: opt.id === id,
      }))
    );
  };

  return (
    <Space direction='vertical' size='large' style={{ width: '100%' }}>
      {/* Question text */}
      <div>
        <Text strong>Question Text</Text>
        <TextArea
          rows={3}
          placeholder='Enter grammar/vocabulary question...'
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          style={{ marginTop: 8 }}
        />
      </div>

      {/* Options */}
      <div>
        <Text strong>Options</Text>

        <Space
          direction='vertical'
          size='small'
          style={{ width: '100%', marginTop: 8 }}
        >
          {options.map((opt, idx) => (
            <Row
              key={opt.id}
              align='middle'
              gutter={12}
              style={{ width: '100%' }}
            >
              {/* Radio chọn đáp án đúng */}
              <Col flex='32px'>
                <Radio
                  checked={opt.isCorrect}
                  onChange={() => setCorrectOption(opt.id)}
                />
              </Col>

              {/* Label A/B/C/D */}
              <Col flex='40px'>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#f0f5ff',
                    color: '#2f54eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                  }}
                >
                  {opt.label || LETTERS[idx] || '?'}
                </div>
              </Col>

              {/* Input text option */}
              <Col flex='auto'>
                <Input
                  placeholder={`Option ${opt.label || LETTERS[idx]}`}
                  value={opt.value}
                  onChange={(e) => updateOptionText(opt.id, e.target.value)}
                />
              </Col>

              {/* Remove button */}
              <Col>
                <Button
                  type='text'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeOption(opt.id)}
                />
              </Col>
            </Row>
          ))}
        </Space>

        <Button
          style={{ marginTop: 12 }}
          type='dashed'
          icon={<PlusOutlined />}
          onClick={addOption}
        >
          Add option
        </Button>
      </div>

      <Text type='secondary'>Tip: click vào radio để chọn đáp án đúng.</Text>
    </Space>
  );
};

export default GrammarMultipleChoiceEditor;
