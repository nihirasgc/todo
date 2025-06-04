import React from 'react';

const Item = ({ item, onEdit, onDelete }) => (
  <div className="item">
    <p>{item.content}</p>
    <button onClick={() => onEdit(item)}>Edit</button>
    <button onClick={() => onDelete(item._id)}>Delete</button>
  </div>
);

export default Item;
