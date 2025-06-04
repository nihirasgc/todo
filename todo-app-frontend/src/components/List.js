import React from 'react';

const List = ({ list, onDelete, onEdit, onView }) => (
  <div className="list">
    <h3>{list.name}</h3>
    <p>{list.description}</p>
    <button onClick={() => onView(list._id)}>View Items</button>
    <button onClick={() => onEdit(list)}>Edit</button>
    <button onClick={() => onDelete(list._id)}>Delete</button>
  </div>
);

export default List;
