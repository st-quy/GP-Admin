import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableOrderingItem = ({ id, children }) => {
  const { setNodeRef, listeners, attributes, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* inject listeners/attributes vào children */}
      {children(listeners, attributes)}
    </div>
  );
};

export default SortableOrderingItem;
