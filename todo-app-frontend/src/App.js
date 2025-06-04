import React, { useEffect, useState } from 'react';
import { getLists, createList, deleteList } from './services/api';
import Navbar from './components/Navbar';
import List from './components/List';
import AddListForm from './components/AddListForm';

const App = () => {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const { data } = await getLists();
      setLists(data);
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  const handleAddList = async (list) => {
    try {
      const { data } = await createList(list);
      setLists([...lists, data]);
    } catch (error) {
      console.error('Error adding list:', error);
    }
  };

  const handleDeleteList = async (id) => {
    try {
      await deleteList(id);
      setLists(lists.filter((list) => list._id !== id));
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <AddListForm onSubmit={handleAddList} />
      <div>
        {lists.map((list) => (
          <List
            key={list._id}
            list={list}
            onDelete={handleDeleteList}
            onEdit={() => {}}
            onView={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
