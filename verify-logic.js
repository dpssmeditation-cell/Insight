
// Mock LocalStorage
const store = new Map();
const localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, val),
    clear: () => store.clear(),
    removeItem: (key) => store.delete(key),
};

// --- DATA ---
const BOOKS = [{ id: 'b1', title: 'Default Book 1' }, { id: 'b2', title: 'Default Book 2' }];
const DB_KEYS = { BOOKS: 'books', DELETED_IDS: 'deleted_ids' };

// --- LOGIC FROM databaseService.ts ---

const getDeletedIds = () => {
    const data = localStorage.getItem(DB_KEYS.DELETED_IDS);
    return new Set(data ? JSON.parse(data) : []);
};

const recordDeletion = (id) => {
    const deletedIds = getDeletedIds();
    deletedIds.add(id);
    localStorage.setItem(DB_KEYS.DELETED_IDS, JSON.stringify(Array.from(deletedIds)));
};

const syncWithDefaults = (key, defaultItems) => {
    const storedData = localStorage.getItem(key);
    const existingItems = storedData ? JSON.parse(storedData) : [];
    const deletedIds = getDeletedIds(); // Logic from file

    const itemMap = new Map();

    // 1. Process items already in storage
    existingItems.forEach(item => {
        if (!deletedIds.has(item.id)) {
            itemMap.set(item.id, item);
        }
    });

    // 2. Process items from defaults
    defaultItems.forEach(item => {
        if (!deletedIds.has(item.id) && !itemMap.has(item.id)) {
            itemMap.set(item.id, item);
        }
    });

    const finalItems = Array.from(itemMap.values());
    localStorage.setItem(key, JSON.stringify(finalItems));
    return finalItems;
};

const save = (key, item) => {
    const data = localStorage.getItem(key);
    const items = data ? JSON.parse(data) : [];
    const index = items.findIndex(i => i.id === item.id);
    let updatedItems;
    if (index > -1) {
        updatedItems = [...items];
        updatedItems[index] = item;
    } else {
        updatedItems = [item, ...items];
    }
    localStorage.setItem(key, JSON.stringify(updatedItems));

    // Remove from deleted if needed
    const deletedIds = getDeletedIds();
    if (deletedIds.has(item.id)) {
        deletedIds.delete(item.id);
        localStorage.setItem(DB_KEYS.DELETED_IDS, JSON.stringify(Array.from(deletedIds)));
    }
    return updatedItems;
};

const deleteItem = (key, id) => {
    recordDeletion(id);
    const data = localStorage.getItem(key);
    const items = data ? JSON.parse(data) : [];
    const updatedItems = items.filter(i => i.id !== id);
    localStorage.setItem(key, JSON.stringify(updatedItems));
    return updatedItems;
};


// --- TESTS ---

console.log('--- STARTING TESTS ---');

// Test 1: Initial Load
console.log('\nTest 1: Initial Load');
store.clear();
let current = syncWithDefaults(DB_KEYS.BOOKS, BOOKS);
console.log('Count:', current.length);
if (current.length !== 2) console.error('FAIL: Expected 2 items');

// Test 2: Add New Item
console.log('\nTest 2: Add New Item');
const newBook = { id: 'new1', title: 'New Book' };
save(DB_KEYS.BOOKS, newBook);
current = JSON.parse(localStorage.getItem(DB_KEYS.BOOKS));
console.log('Count after save:', current.length);
if (current.length !== 3) console.error('FAIL: Expected 3 items');

// Test 3: Reload (Sync)
console.log('\nTest 3: Reload (Sync)');
// Simulate reload by calling sync again with same storage
current = syncWithDefaults(DB_KEYS.BOOKS, BOOKS);
console.log('Count after reload:', current.length);
if (current.length !== 3) console.error('FAIL: Expected 3 items (preserved new item)');
const ids = current.map(i => i.id);
if (!ids.includes('new1')) console.error('FAIL: Missing new item');

// Test 4: Delete Default Item
console.log('\nTest 4: Delete Default Item');
deleteItem(DB_KEYS.BOOKS, 'b1');
current = JSON.parse(localStorage.getItem(DB_KEYS.BOOKS));
console.log('Count after delete:', current.length);
if (current.length !== 2) console.error('FAIL: Expected 2 items');

// Test 5: Reload after Delete
console.log('\nTest 5: Reload after Delete');
current = syncWithDefaults(DB_KEYS.BOOKS, BOOKS);
console.log('Count after reload:', current.length);
if (current.length !== 2) console.error('FAIL: Should stay deleted');
if (current.find(i => i.id === 'b1')) console.error('FAIL: b1 reappeared');

// Test 6: Delete New Item
console.log('\nTest 6: Delete New Item');
deleteItem(DB_KEYS.BOOKS, 'new1');
current = JSON.parse(localStorage.getItem(DB_KEYS.BOOKS));
console.log('Count after delete new:', current.length); // Should be 1 (b2)

// Test 7: Reload after delete new
console.log('\nTest 7: Reload after delete new');
current = syncWithDefaults(DB_KEYS.BOOKS, BOOKS);
console.log('Count:', current.length);
if (current.length !== 1) console.error('FAIL: Expected 1 item (b2)');
if (current[0].id !== 'b2') console.error('FAIL: Wrong item');

console.log('\n--- TESTS COMPLETED ---');
