import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Update if backend runs on a different port

export const getLists = () => axios.get(`${API_URL}/lists`);
export const createList = (list) => axios.post(`${API_URL}/lists`, list);
export const updateList = (id, list) => axios.put(`${API_URL}/lists/${id}`, list);
export const deleteList = (id) => axios.delete(`${API_URL}/lists/${id}`);

export const getItems = () => axios.get(`${API_URL}/items`);
export const getItemsByList = (listId) => axios.get(`${API_URL}/items/list/${listId}`);
export const createItem = (item) => axios.post(`${API_URL}/items`, item);
export const updateItem = (id, item) => axios.put(`${API_URL}/items/${id}`, item);
export const deleteItem = (id) => axios.delete(`${API_URL}/items/${id}`);
