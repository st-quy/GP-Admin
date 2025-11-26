// DraggableAnswer.jsx
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const DraggableAnswer = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id, // ID thật của item – quan trọng!
    });

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
          height: 50,
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {item.text}
      </div>
    </div>
  );
};

export default DraggableAnswer;
