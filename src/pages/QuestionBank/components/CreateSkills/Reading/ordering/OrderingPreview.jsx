import React, { useState, useEffect } from 'react';
import { Card, Typography } from 'antd';
import {
  DndContext,
  useDraggable,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import SlotItem from './SlotItem'; // IMPORT COMPONENT FIX HOOK!!
import { CSS } from '@dnd-kit/utilities';

const { Text } = Typography;

/* ------------- Draggable Answer ------------- */
function DraggableAnswer({ item }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: 'grab',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <div
        style={{
          padding: '16px 18px',
          borderRadius: 12,
          border: '1px solid #d5dbe6',
          background: '#fff',
          marginBottom: 12,
          height: 72,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {item.text}
      </div>
    </div>
  );
}

/* ------------- Pool Droppable ------------- */
function PoolZone({ children }) {
  const { setNodeRef } = useDroppable({ id: 'POOL' });

  return <div ref={setNodeRef}>{children}</div>;
}

/* ------------- MAIN COMPONENT ------------- */
export default function OrderingPreview({ items = [] }) {
  const [answers, setAnswers] = useState(items);

  const [positions, setPositions] = useState(() => {
    const map = {};
    items.forEach((i) => (map[i.id] = 'pool'));
    return map;
  });

  /* sync items from parent */
  useEffect(() => {
    setAnswers(items);
    const map = {};
    items.forEach((i) => (map[i.id] = 'pool'));
    setPositions(map);
  }, [items]);

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;

    const itemId = active.id;
    const overId = over.id;

    if (overId === 'POOL') {
      setPositions((p) => ({ ...p, [itemId]: 'pool' }));
      return;
    }

    if (String(overId).startsWith('slot-')) {
      const slotIndex = Number(overId.replace('slot-', ''));

      setPositions((prev) => {
        const next = { ...prev };

        // clear slot trước
        Object.keys(next).forEach((key) => {
          if (next[key] === slotIndex) next[key] = 'pool';
        });

        // assign item vào slot
        next[itemId] = slotIndex;

        return next;
      });
    }
  };

  const poolItems = answers.filter((a) => positions[a.id] === 'pool');

  const getSlotItem = (idx) =>
    answers.find((a) => positions[a.id] === idx) || null;

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <Card>
        <div style={{ display: 'flex', gap: 32 }}>
          {/* LEFT SLOTS */}
          <div style={{ flex: 1 }}>
            {answers.map((_, idx) => (
              <SlotItem
                key={idx}
                slotIndex={idx}
                assignedItem={getSlotItem(idx)}
              />
            ))}
          </div>

          {/* RIGHT POOL */}
          <div style={{ flex: 1 }}>
            <PoolZone>
              {poolItems.map((item) => (
                <DraggableAnswer key={item.id} item={item} />
              ))}
            </PoolZone>
          </div>
        </div>
      </Card>
    </DndContext>
  );
}
