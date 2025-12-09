// UpdateReading.jsx
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Space, Typography, message } from 'antd';

import { buildFullReadingPayload } from '@features/questions/utils/buildQuestionPayload';
import {
  useGetQuestionGroupDetail,
  useUpdateQuestionGroup,
} from '@features/questions/hooks';
import { useNavigate, useParams } from 'react-router-dom';

import DropdownBlankOptions from '../CreateSkills/Reading/dropdown/DropdownBlankOptions';
import DropdownEditor from '../CreateSkills/Reading/dropdown/DropdownEditor';
import DropdownPreview from '../CreateSkills/Reading/dropdown/DropdownPreview';
import MatchingEditor from '../CreateSkills/Reading/matching/MatchingEditor';
import MatchingEditorPart4 from '../CreateSkills/Reading/matching/MatchingEditorPart4';
import OrderingEditor from '../CreateSkills/Reading/ordering/OrderingEditor';

const UpdateReading = () => {
  const navigate = useNavigate();
  const { id: sectionId } = useParams();
  const [form] = Form.useForm();
  const { data, isFetching } = useGetQuestionGroupDetail('READING', sectionId);
  const { mutate: updateReading } = useUpdateQuestionGroup();

  const [dataLoaded, setDataLoaded] = useState(false);
  const [part1Content, setPart1Content] = useState('');
  const [part1Blanks, setPart1Blanks] = useState([]);

  /** WATCH PART 1 CONTENT + BLANKS */
  const watchPart1Content = Form.useWatch(['part1', 'content'], form);
  const watchPart1Blanks = Form.useWatch(['part1', 'blanks'], form);

  useEffect(() => {
    setPart1Content(watchPart1Content);
    setPart1Blanks(watchPart1Blanks);
  }, [watchPart1Content, watchPart1Blanks]);

  // ---------------------------------------------------------
  // Convert ordering API -> correct sorted items
  // ---------------------------------------------------------
  const transformOrdering = (apiPart) => {
    if (!apiPart) return null;

    const options = apiPart.AnswerContent?.options || [];
    const correctAnswer = apiPart.AnswerContent?.correctAnswer || [];

    const orderMap = {};
    correctAnswer.forEach((a) => (orderMap[a.key] = a.value));

    const items = options.map((opt) => ({
      text: opt,
      order: orderMap[opt] ?? 999,
    }));

    items.sort((a, b) => a.order - b.order);

    return {
      id: apiPart.PartID,
      name: apiPart.PartName || '',
      intro: apiPart.Content || '',
      items: items.map((x) => ({ text: x.text })),
    };
  };

  // ---------------------------------------------------------
  // Transform API → Form
  // ---------------------------------------------------------
  const transformApiDataToForm = (apiData) => {
    if (!apiData) return null;

    const transformed = {
      sectionName: apiData.SectionName || '',
    };

    /* ---------------- PART 1 ---------------- */
    if (apiData.part1) {
      const apiBlanks = apiData.part1.AnswerContent?.options || [];
      const apiCorrect = apiData.part1.AnswerContent?.correctAnswer || [];

      let content =
        apiData.part1.AnswerContent?.content || apiData.part1.Content || '';

      // remove parentheses
      content = content.replace(/\([^()]*\)/g, '');

      apiBlanks.forEach((opt) => {
        const key = String(opt.key);
        const rmPunct = new RegExp(`\\b${key}[\\.,);:!?-]`, 'g');
        content = content.replace(rmPunct, key);

        const bare = new RegExp(`\\b${key}\\b`, 'g');
        content = content.replace(bare, `[${key}]`);
      });

      // remove parentheses only
      content = content.replace(/\([^()]*\)/g, '');

      // chuẩn hoá newline nhưng giữ nguyên formatting
      content = content
        .replace(/\r\n/g, '\n') // Windows → Unix newline
        .replace(/[ ]+\n/g, '\n') // bỏ space trước newline
        .replace(/\n{2,}/g, '\n') // bỏ newline dư
        .trim();
        
      const transformedBlanks = apiBlanks.map((opt) => {
        const correctObj = apiCorrect.find((a) => a.key === opt.key);
        const correctValue = correctObj?.value;

        const options = (opt.value || []).map((v, idx) => ({
          id: `${opt.key}-${idx}`,
          value: v,
        }));

        const correctOption = options.find((o) => o.value === correctValue);

        return {
          key: opt.key,
          options,
          correctAnswer: correctOption?.id || '',
        };
      });

      transformed.part1 = {
        id: apiData.part1.PartID,
        name: apiData.part1.PartName,
        content,
        blanks: transformedBlanks,
      };
    }

    /* ---------------- PART 2A ---------------- */
    if (apiData.part2) transformed.part2A = transformOrdering(apiData.part2);

    /* ---------------- PART 2B ---------------- */
    if (apiData.part3) transformed.part2B = transformOrdering(apiData.part3);

    /* ---------------- PART 4 (Dropdown-matching) ---------------- */
    if (apiData.part4) {
      const AC = apiData.part4.AnswerContent;

      const leftItems = AC.leftItems.map((t, i) => ({
        id: `L-${i}-${Math.random()}`,
        text: t.replace(/^\s*\d+\.\s*/, ''),
      }));

      const rightItems = AC.rightItems.map((t, i) => ({
        id: `R-${i}-${Math.random()}`,
        text: t,
      }));

      const mapping = AC.correctAnswer.map((a) => {
        const leftIndex = Number(a.key) - 1;
        const rightItem = rightItems.find((r) => r.text === a.value);

        return {
          leftIndex,
          rightId: rightItem?.id || null,
        };
      });

      transformed.part3 = {
        id: apiData.part4.PartID,
        name: apiData.part4.PartName,
        content: apiData.part4.Content,
        leftItems,
        rightItems,
        mapping,
      };
    }

    /* ---------------- PART 5 (Full matching) ---------------- */
    if (apiData.part5) {
      const AC = apiData.part5.AnswerContent;

      const leftItems = AC.leftItems.map((t, i) => ({
        id: `L5-${i}-${Math.random()}`,
        text: t,
      }));

      const rightItems = AC.rightItems.map((t, i) => ({
        id: `R5-${i}-${Math.random()}`,
        text: t,
      }));

      const mapping = AC.correctAnswer.map((a) => {
        const leftIndex = leftItems.findIndex((l) => l.text === a.left);
        const rightItem = rightItems.find((r) => r.text === a.right);

        return {
          leftIndex,
          rightId: rightItem?.id || null,
        };
      });

      transformed.part4 = {
        id: apiData.part5.PartID,
        name: apiData.part5.PartName,
        content: AC.content,
        leftItems,
        rightItems,
        mapping,
      };
    }

    return transformed;
  };

  useEffect(() => {
    if (data && !dataLoaded) {
      const transformed = transformApiDataToForm(data);

      form.setFieldsValue(transformed);

      if (transformed.part1) {
        setPart1Content(transformed.part1.content);
        setPart1Blanks(transformed.part1.blanks);
      }

      setDataLoaded(true);
    }
  }, [data, dataLoaded]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = buildFullReadingPayload(values);

      updateReading(
        { sectionId, payload },
        {
          onSuccess: () => {
            message.success('Update reading section successfully!');
            navigate(-1);
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (isFetching || !dataLoaded) return <div>Loading...</div>;

  return (
    <Form form={form} layout='vertical'>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        {/* SECTION INFO */}
        <Card title='Section Information'>
          <Form.Item
            label='Name'
            name='sectionName'
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Card>

        {/* PART 1 */}
        <Card title='Part 1 (Dropdown)'>
          <Form.Item name={['part1', 'id']} hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label='Part Name'
            name={['part1', 'name']}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='Content'
            name={['part1', 'content']}
            rules={[{ required: true }]}
          >
            <DropdownEditor />
          </Form.Item>

          <DropdownBlankOptions />

          <Typography.Text strong>Preview:</Typography.Text>
          <div
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}
          >
            <div
              style={{
                fontSize: 16,
                lineHeight: 2.4,
                whiteSpace: 'pre-wrap',
              }}
            >
              <DropdownPreview content={part1Content} blanks={part1Blanks} />
            </div>
          </div>
        </Card>

        {/* PART 2A */}
        <Card title='Part 2 (Ordering)'>
          <Form.Item name={['part2A', 'id']} hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label='Part Name'
            name={['part2A', 'name']}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='Introduction'
            name={['part2A', 'intro']}
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.List name={['part2A', 'items']}>
            {(fields, helpers) => (
              <OrderingEditor fields={fields} helpers={helpers} />
            )}
          </Form.List>
        </Card>

        {/* PART 2B */}
        <Card title='Part 3 (Ordering)'>
          <Form.Item name={['part2B', 'id']} hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label='Part Name'
            name={['part2B', 'name']}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='Introduction'
            name={['part2B', 'intro']}
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.List name={['part2B', 'items']}>
            {(fields, helpers) => (
              <OrderingEditor fields={fields} helpers={helpers} />
            )}
          </Form.List>
        </Card>

        {/* PART 5 */}
        <Card title='Part 4 (Matching)'>
          <Form.Item name={['part3', 'id']} hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label='Part Name'
            name={['part3', 'name']}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='Content'
            name={['part3', 'content']}
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item name={['part3']}>
            <MatchingEditor />
          </Form.Item>
        </Card>

        {/* PART 4 */}
        <Card title='Part 5 (Matching)'>
          <Form.Item name={['part4', 'id']} hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label='Part Name'
            name={['part4', 'name']}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='Content'
            name={['part4', 'content']}
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item name={['part4']}>
            <MatchingEditorPart4 />
          </Form.Item>
        </Card>

        <div className='flex justify-end gap-4'>
          <Button onClick={() => navigate(-1)}>Cancel</Button>
          <Button type='primary' className='bg-blue-900' onClick={handleSubmit}>
            Update
          </Button>
        </div>
      </Space>
    </Form>
  );
};

export default UpdateReading;
