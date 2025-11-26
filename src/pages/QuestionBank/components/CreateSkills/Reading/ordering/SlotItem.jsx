// SlotItem.jsx
import { useDroppable } from '@dnd-kit/core';
import { Typography } from 'antd';
import DraggableAnswer from './DraggableAnswer';
const { Text } = Typography;

export default function SlotItem({ slotIndex, assignedItem }) {
  const id = `slot-${slotIndex}`;
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        border: '2px dashed #d5dbe6',
        borderRadius: 12,
        padding: '16px 20px',
        height: 72,
        background: isOver ? '#eef7ff' : '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
      }}
    >
      {/* Number */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#1c2f6d',
          color: '#fff',
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {slotIndex + 1}
      </div>

      {/* CONTENT (NOW DRAGGABLE) */}
      <div style={{ flex: 1 }}>
        {assignedItem ? (
          <DraggableAnswer item={assignedItem} />
        ) : (
          <Text type='secondary'>Drag here</Text>
        )}
      </div>
    </div>
  );
}
