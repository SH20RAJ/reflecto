"use client";

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TestPage() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [oldItem, setOldItem] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [deleteItem, setDeleteItem] = useState('');
  const [status, setStatus] = useState('');

  // Fetch all items
  const fetchItems = async () => {
    try {
      setStatus('Fetching items...');
      const response = await fetch('/api/test');
      
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setStatus('Items fetched successfully');
      } else {
        const error = await response.json();
        setStatus(`Error: ${error.error || 'Failed to fetch items'}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  // Create a new item
  const createItem = async (e) => {
    e.preventDefault();
    try {
      setStatus('Creating item...');
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bar: newItem }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems([...items, data]);
        setNewItem('');
        setStatus('Item created successfully');
      } else {
        const error = await response.json();
        setStatus(`Error: ${error.error || 'Failed to create item'}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  // Update an item
  const updateItem = async (e) => {
    e.preventDefault();
    try {
      setStatus('Updating item...');
      const response = await fetch('/api/test', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldBar: oldItem, newBar: newItemValue }),
      });
      
      if (response.ok) {
        await fetchItems(); // Refresh the list
        setOldItem('');
        setNewItemValue('');
        setStatus('Item updated successfully');
      } else {
        const error = await response.json();
        setStatus(`Error: ${error.error || 'Failed to update item'}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  // Delete an item
  const deleteItemFunc = async (e) => {
    e.preventDefault();
    try {
      setStatus('Deleting item...');
      const response = await fetch('/api/test', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bar: deleteItem }),
      });
      
      if (response.ok) {
        await fetchItems(); // Refresh the list
        setDeleteItem('');
        setStatus('Item deleted successfully');
      } else {
        const error = await response.json();
        setStatus(`Error: ${error.error || 'Failed to delete item'}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">Database CRUD Test</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Test CRUD operations on the Turso database using Drizzle ORM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column - Read and Create */}
            <div className="space-y-8">
              {/* Read section */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Read Items</h2>
                <button 
                  onClick={fetchItems}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mb-4"
                >
                  Refresh Items
                </button>
                <div className="mt-4 border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Bar Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {items.length > 0 ? (
                        items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {item.bar}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Create section */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Create Item</h2>
                <form onSubmit={createItem}>
                  <div className="mb-4">
                    <label htmlFor="newItem" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Item Value
                    </label>
                    <input
                      type="text"
                      id="newItem"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Create Item
                  </button>
                </form>
              </div>
            </div>

            {/* Right column - Update and Delete */}
            <div className="space-y-8">
              {/* Update section */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Update Item</h2>
                <form onSubmit={updateItem}>
                  <div className="mb-4">
                    <label htmlFor="oldItem" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Old Item Value
                    </label>
                    <input
                      type="text"
                      id="oldItem"
                      value={oldItem}
                      onChange={(e) => setOldItem(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="newItemValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Item Value
                    </label>
                    <input
                      type="text"
                      id="newItemValue"
                      value={newItemValue}
                      onChange={(e) => setNewItemValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Update Item
                  </button>
                </form>
              </div>

              {/* Delete section */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Delete Item</h2>
                <form onSubmit={deleteItemFunc}>
                  <div className="mb-4">
                    <label htmlFor="deleteItem" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Item Value to Delete
                    </label>
                    <input
                      type="text"
                      id="deleteItem"
                      value={deleteItem}
                      onChange={(e) => setDeleteItem(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                  >
                    Delete Item
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Status section */}
          <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Status</h2>
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <p className="text-gray-900 dark:text-gray-100">{status || 'Ready'}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
