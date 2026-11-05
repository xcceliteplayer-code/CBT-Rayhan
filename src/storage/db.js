/**
 * IndexedDB wrapper for CBT Demo
 */
const DB_NAME = 'cbt-smart-exam';
const DB_VERSION = 1;

const STORES = {
  participants: 'participants',
  exams: 'exams',
  questions: 'questions',
  answers: 'answers',
  sessions: 'sessions',
  results: 'results',
  logs: 'logs'
};

let db = null;

export async function openDB() {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains(STORES.participants)) {
        database.createObjectStore(STORES.participants, { keyPath: 'nisn' });
      }
      if (!database.objectStoreNames.contains(STORES.exams)) {
        database.createObjectStore(STORES.exams, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.questions)) {
        const qs = database.createObjectStore(STORES.questions, { keyPath: 'id' });
        qs.createIndex('examId', 'examId', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.answers)) {
        const as = database.createObjectStore(STORES.answers, { keyPath: 'id' });
        as.createIndex('sessionId', 'sessionId', { unique: false });
      }
      if (!database.objectStoreNames.contains(STORES.sessions)) {
        database.createObjectStore(STORES.sessions, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.results)) {
        database.createObjectStore(STORES.results, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(STORES.logs)) {
        const ls = database.createObjectStore(STORES.logs, { keyPath: 'id', autoIncrement: true });
        ls.createIndex('sessionId', 'sessionId', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

function tx(storeName, mode = 'readonly') {
  return db.transaction(storeName, mode).objectStore(storeName);
}

export async function put(storeName, value) {
  await openDB();
  return new Promise((resolve, reject) => {
    const request = tx(storeName, 'readwrite').put(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function get(storeName, key) {
  await openDB();
  return new Promise((resolve, reject) => {
    const request = tx(storeName).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAll(storeName, indexName, query) {
  await openDB();
  return new Promise((resolve, reject) => {
    const store = tx(storeName);
    const source = indexName ? store.index(indexName) : store;
    const request = query !== undefined ? source.getAll(query) : source.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function remove(storeName, key) {
  await openDB();
  return new Promise((resolve, reject) => {
    const request = tx(storeName, 'readwrite').delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clear(storeName) {
  await openDB();
  return new Promise((resolve, reject) => {
    const request = tx(storeName, 'readwrite').clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export { STORES };
