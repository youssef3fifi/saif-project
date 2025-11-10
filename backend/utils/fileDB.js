const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Read JSON file
async function readJSON(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// Write JSON file
async function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Find one record matching query
async function findOne(filename, query) {
  const data = await readJSON(filename);
  return data.find(item => {
    return Object.keys(query).every(key => {
      if (key === 'id' || key === '_id') {
        return item.id === query[key] || item.id === parseInt(query[key]);
      }
      return item[key] === query[key];
    });
  });
}

// Find all records matching query (empty query returns all)
async function findAll(filename, query = {}) {
  const data = await readJSON(filename);
  
  if (Object.keys(query).length === 0) {
    return data;
  }
  
  return data.filter(item => {
    return Object.keys(query).every(key => item[key] === query[key]);
  });
}

// Create new record with auto-increment ID
async function create(filename, newData) {
  const data = await readJSON(filename);
  
  // Find max ID and increment
  const maxId = data.length > 0 ? Math.max(...data.map(item => item.id || 0)) : 0;
  const record = {
    id: maxId + 1,
    ...newData,
    createdAt: new Date().toISOString()
  };
  
  data.push(record);
  await writeJSON(filename, data);
  return record;
}

// Update existing record by ID
async function update(filename, id, updates) {
  const data = await readJSON(filename);
  const index = data.findIndex(item => item.id === parseInt(id));
  
  if (index === -1) {
    return null;
  }
  
  data[index] = {
    ...data[index],
    ...updates,
    id: data[index].id, // Preserve original ID
  };
  
  await writeJSON(filename, data);
  return data[index];
}

// Delete record by ID
async function deleteOne(filename, id) {
  const data = await readJSON(filename);
  const index = data.findIndex(item => item.id === parseInt(id));
  
  if (index === -1) {
    return null;
  }
  
  const deleted = data.splice(index, 1)[0];
  await writeJSON(filename, data);
  return deleted;
}

// Search records with regex-like matching
async function search(filename, searchFields, searchTerm) {
  const data = await readJSON(filename);
  const lowerSearch = searchTerm.toLowerCase();
  
  return data.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(lowerSearch);
    });
  });
}

// Initialize JSON files with default data if they don't exist
async function initializeData() {
  await ensureDataDir();
  
  // Initialize users.json
  const usersPath = path.join(DATA_DIR, 'users.json');
  try {
    await fs.access(usersPath);
  } catch (error) {
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    
    const defaultUsers = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@library.com',
        password: adminPassword,
        role: 'admin',
        borrowedBooks: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Regular User',
        email: 'user@library.com',
        password: userPassword,
        role: 'user',
        borrowedBooks: [],
        createdAt: new Date().toISOString()
      }
    ];
    await writeJSON('users.json', defaultUsers);
  }
  
  // Initialize books.json
  const booksPath = path.join(DATA_DIR, 'books.json');
  try {
    await fs.access(booksPath);
  } catch (error) {
    const defaultBooks = [
      {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        category: 'Fiction',
        quantity: 5,
        available: 5,
        description: 'A classic American novel',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780061120084',
        category: 'Fiction',
        quantity: 3,
        available: 3,
        description: 'A gripping tale of racial injustice',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        category: 'Science Fiction',
        quantity: 4,
        available: 4,
        description: 'Dystopian social science fiction',
        createdAt: new Date().toISOString()
      }
    ];
    await writeJSON('books.json', defaultBooks);
  }
  
  // Initialize transactions.json
  const transactionsPath = path.join(DATA_DIR, 'transactions.json');
  try {
    await fs.access(transactionsPath);
  } catch (error) {
    await writeJSON('transactions.json', []);
  }
}

module.exports = {
  ensureDataDir,
  readJSON,
  writeJSON,
  findOne,
  findAll,
  create,
  update,
  deleteOne,
  search,
  initializeData
};
