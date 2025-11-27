import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import {
  DndContext,
  useDraggable,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import SlotItem from './SlotItem'; // IMPORT COMPONENT FIX HOOK!!
import { CSS } from '@dnd-kit/utilities';

/**
 * items: [{ id, text }]
 * initialPositions (optional): { [itemId]: number | 'pool' }
 *  - number: index slot (0-based)
 *  - 'pool': nằm ở pool bên phải
 */

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

function PoolZone({ children }) {
  const { setNodeRef } = useDroppable({ id: 'POOL' });
  return <div ref={setNodeRef}>{children}</div>;
}

export default function OrderingPreview({ items = [], initialPositions }) {
  const [answers, setAnswers] = useState(items);

  const buildDefaultPositions = (srcItems) => {
    const map = {};
    srcItems.forEach((i) => {
      map[i.id] = 'pool';
    });
    return map;
  };

  const buildPositionsFromInitial = (srcItems, init) => {
    if (!init) return buildDefaultPositions(srcItems);

    const map = buildDefaultPositions(srcItems);

    Object.keys(init).forEach((itemId) => {
      const pos = init[itemId];
      if (pos === 'pool' || typeof pos === 'undefined' || pos === null) return;
      // đảm bảo là số
      if (typeof pos === 'number' && !Number.isNaN(pos)) {
        map[itemId] = pos; // slot index (0-based)
      }
    });

    return map;
  };

  const [positions, setPositions] = useState(() =>
    buildPositionsFromInitial(items, initialPositions)
  );

  // sync items + initialPositions từ parent
  useEffect(() => {
    setAnswers(items);
    setPositions(buildPositionsFromInitial(items, initialPositions));
  }, [items, initialPositions]);

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

        // clear slot này khỏi item khác
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
