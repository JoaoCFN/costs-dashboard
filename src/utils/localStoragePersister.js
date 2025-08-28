export const localStoragePersister = {
  persistClient: async (client) => {
    localStorage.setItem('REACT_QUERY_OFFLINE_CACHE', JSON.stringify(client));
  },
  restoreClient: async () => {
    const cache = localStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
    if (!cache) return undefined;
    return JSON.parse(cache);
  },
  removeClient: async () => {
    localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
  },
};