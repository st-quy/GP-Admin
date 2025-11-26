import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Card, Button, Input, Space, Typography, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, MenuOutlined } from '@ant-design/icons';

import SortableOrderingItem from './SortableOrderingItem';

const OrderingEditor = ({
  items,
  setItems,
  autoShuffle = false,
  setAutoShuffle = null,
}) => {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: Date.now(), text: '' }]);
  };

  const updateItem = (id, text) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
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
        <Button type='primary' icon={<PlusOutlined />} onClick={addItem}>
          Add Sentence
        </Button>

        <Space>
          <Switch checked={autoShuffle} onChange={(v) => setAutoShuffle(v)} />
          <Typography.Text strong>Auto Shuffle Answer Order</Typography.Text>
        </Space>
      </Space>

      {/* List */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <Space direction='vertical' style={{ width: '100%' }}>
            {items.map((item, index) => (
              <SortableOrderingItem key={item.id} id={item.id}>
                {(listeners, attributes) => (
                  <Card
                    size='small'
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                    }}
                    // bodyStyle={{ width: '100%' }}
                    className='[&_.ant-card-body]:!w-full'
                  >
                    <Space align='center' style={{ width: '100%' }}>
                      {/* Drag handle */}
                      <MenuOutlined
                        {...listeners}
                        {...attributes}
                        style={{
                          cursor: 'grab',
                          color: '#888',
                          fontSize: 18,
                          paddingRight: 8,
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

                      {/* Input */}
                      <Input
                        value={item.text}
                        placeholder={`Enter sentence ${index + 1}`}
                        onChange={(e) => updateItem(item.id, e.target.value)}
                        style={{ flex: 1 }}
                        className='w-full'
                      />

                      {/* Delete */}
                      <DeleteOutlined
                        onClick={() => removeItem(item.id)}
                        style={{
                          color: 'red',
                          fontSize: 18,
                          cursor: 'pointer',
                        }}
                      />
                    </Space>
                  </Card>
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
