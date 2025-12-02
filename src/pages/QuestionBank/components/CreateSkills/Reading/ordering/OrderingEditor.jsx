// Reading/ordering/OrderingEditor.jsx
import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Card, Button, Input, Space, Typography, Form } from 'antd';
import { PlusOutlined, DeleteOutlined, MenuOutlined } from '@ant-design/icons';

import SortableOrderingItem from './SortableOrderingItem';

const OrderingEditor = ({ fields, helpers }) => {
  const form = Form.useFormInstance();

  const items = fields.map((f) => f.key);

  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);

      helpers.move(oldIndex, newIndex);
    }
  };

  return (
    <div className='pt-4'>
      {/* Header */}
      <Space
        align='center'
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => helpers.add({ text: '' })}
        >
          Add Sentence
        </Button>
      </Space>

      {/* Sortable list */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <Space direction='vertical' style={{ width: '100%' }}>
            {fields.map((field, index) => (
              <SortableOrderingItem key={field.key} id={field.key}>
                {(listeners, attributes) => (
                  <Form.Item
                    key={field.key}
                    name={[field.name, 'text']}
                    rules={[
                      { required: true, message: 'Sentence is required' },
                    ]}
                    style={{ flex: 1, margin: 0 }}
                  >
                    <Card
                      size='small'
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 10,
                      }}
                      className='[&_.ant-card-body]:!w-full [&_.ant-card-body]:!flex'
                    >
                      <Space
                        align='center'
                        style={{
                          width: '100%',
                          display: 'flex',
                          gap: 12,
                        }}
                      >
                        {/* Drag handle */}
                        <MenuOutlined
                          {...listeners}
                          {...attributes}
                          style={{
                            cursor: 'grab',
                            color: '#888',
                            fontSize: 18,
                            paddingRight: 4,
                          }}
                        />

                        {/* Number circle */}
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#1c2f6d',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontWeight: 600,
                          }}
                        >
                          {index + 1}
                        </div>

                        {/* INPUT EXPANDS FULL WIDTH */}
                        <div style={{ flex: 1 }}>
                          <Input
                            placeholder={`Enter sentence ${index + 1}`}
                            style={{ width: '100%' }}
                          />
                        </div>

                        {/* Delete button */}
                        <DeleteOutlined
                          onClick={() => helpers.remove(field.name)}
                          style={{
                            color: 'red',
                            fontSize: 18,
                            cursor: 'pointer',
                          }}
                        />
                      </Space>
                    </Card>
                  </Form.Item>
                )}
              </SortableOrderingItem>
            ))}
          </Space>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default OrderingEditor;
