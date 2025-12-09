import React, { useEffect } from 'react';
import { Card, Button, message, Form, Input } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

import { WRITING_PART_TYPES } from '@features/questions/constant/writingType';
import {
  useGetQuestionGroupDetail,
  useUpdateQuestionGroup,
} from '@features/questions/hooks';
import { buildWritingFullPayload } from '@features/questions/utils/buildQuestionPayload';
import WritingEditor from '../CreateSkills/Writing/WritingEditor';

const UpdateWriting = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id: sectionId } = useParams();

  const { data: detail, isFetching } = useGetQuestionGroupDetail(
    'WRITING',
    sectionId
  );
  const { mutate: updateWritingGroup, isPending } = useUpdateQuestionGroup();

  // --- MAP API → FORM VALUES ---
  useEffect(() => {
    if (!detail) return;

    form.setFieldsValue({
      sectionName: detail.SectionName || '',

      // ===== PART 1 =====
      part1: {
        PartID: detail.part1?.PartID,
        title: detail.part1?.name || '',
        questions: detail.part1?.questions?.map((q) => ({
          question: q.question,
        })) || [{ question: '' }],
      },

      // ===== PART 2 =====
      part2: {
        PartID: detail.part2?.PartID,
        title: detail.part2?.name || '',
        question: detail.part2?.question || '',
        fields: [''], // form filling FE dùng fields nhưng API không có → giữ default
      },

      // ===== PART 3 =====
      part3: {
        PartID: detail.part3?.PartID,
        title: detail.part3?.name || '',
        chats: detail.part3?.chats?.map((c) => ({
          speaker: c.speaker,
          question: c.question,
          wordLimit: '', // API không trả → để rỗng
        })) || [{ speaker: '', question: '', wordLimit: '' }],
      },

      // ===== PART 4 =====
      part4: {
        PartID: detail.part4?.PartID,
        partName: detail.part4?.name || '',
        emailText: detail.part4?.emailText || '',
        q1: detail.part4?.q1 || '',
        q1_wordLimit: detail.part4?.q1_wordLimit || '',
        q2: detail.part4?.q2 || '',
        q2_wordLimit: detail.part4?.q2_wordLimit || '',
      },
    });
  }, [detail]);

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

      const payload = buildWritingFullPayload(values);

      updateWritingGroup(
        { sectionId, payload },
        {
          onSuccess: () => {
            message.success('Writing test updated successfully!');
            navigate(-1);
          },
          onError: (err) => {
            message.error(err?.response?.data?.message || 'Update failed');
          },
        }
      );
    } catch (err) {
      console.error(err);
      message.error('Validation failed');
    }
  };

  if (isFetching) return <p>Loading...</p>;

  return (
    <Form
      form={form}
      layout='vertical'
      className='flex flex-col gap-8 pb-20'
      initialValues={{
        sectionName: '',
        part1: { title: '', questions: [{ question: '' }] },
        part2: { title: '', question: '', fields: [''] },
        part3: {
          title: '',
          chats: [{ speaker: '', question: '', wordLimit: '' }],
        },
        part4: {
          emailText: '',
          q1: '',
          q1_wordLimit: '',
          q2: '',
          q2_wordLimit: '',
        },
      }}
    >
      {/* SECTION */}
      <Card title='Section Information'>
        {/* HIDDEN: giữ PartID cho 4 phần (sẽ không hiển thị) */}
        <Form.Item name={['part1', 'PartID']} style={{ display: 'none' }}>
          <Input />
        </Form.Item>
        <Form.Item name={['part2', 'PartID']} style={{ display: 'none' }}>
          <Input />
        </Form.Item>
        <Form.Item name={['part3', 'PartID']} style={{ display: 'none' }}>
          <Input />
        </Form.Item>
        <Form.Item name={['part4', 'PartID']} style={{ display: 'none' }}>
          <Input />
        </Form.Item>
        <Form.Item
          label='Section Name'
          name='sectionName'
          rules={[{ required: true, message: 'Section name is required' }]}
        >
          <Input placeholder='e.g., Fitness Club Writing Test' />
        </Form.Item>
      </Card>

      {/* PART 1 */}
      <Card title='Part 1 — Short Answers'>
        <WritingEditor partType={WRITING_PART_TYPES.PART1_SHORT_ANSWERS} />
      </Card>

      {/* PART 2 */}
      <Card title='Part 2 — Form Filling'>
        <WritingEditor partType={WRITING_PART_TYPES.PART2_FORM_FILLING} />
      </Card>

      {/* PART 3 */}
      <Card title='Part 3 — Chat Room'>
        <WritingEditor partType={WRITING_PART_TYPES.PART3_CHAT_ROOM} />
      </Card>

      {/* PART 4 */}
      <Card title='Part 4 — Email Writing'>
        <WritingEditor partType={WRITING_PART_TYPES.PART4_EMAIL_WRITING} />
      </Card>

      {/* ACTION BUTTONS */}
      <div className='flex justify-end gap-4'>
        <Button size='large' onClick={() => navigate(-1)}>
          Cancel
        </Button>

        <Button
          type='primary'
          size='large'
          loading={isPending}
          className='bg-blue-900'
          onClick={handleUpdate}
        >
          Update
        </Button>
      </div>
    </Form>
  );
};

export default UpdateWriting;
