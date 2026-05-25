import { useState, useEffect, useCallback } from 'react';
import { snippetAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const useSnippets = () => {
  const { isAuthenticated } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSnippets = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const res = await snippetAPI.getAll();
      setSnippets(res.data.snippets);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load snippets.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  const saveSnippet = useCallback(async (data) => {
    try {
      const res = await snippetAPI.create(data);
      setSnippets((prev) => [res.data.snippet, ...prev]);
      return { success: true, snippet: res.data.snippet };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to save snippet.',
      };
    }
  }, []);

  const updateSnippet = useCallback(async (id, data) => {
    try {
      const res = await snippetAPI.update(id, data);
      setSnippets((prev) =>
        prev.map((s) => (s._id === id ? res.data.snippet : s))
      );
      return { success: true, snippet: res.data.snippet };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update snippet.',
      };
    }
  }, []);

  const deleteSnippet = useCallback(async (id) => {
    try {
      await snippetAPI.delete(id);
      setSnippets((prev) => prev.filter((s) => s._id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to delete snippet.',
      };
    }
  }, []);

  return {
    snippets,
    loading,
    error,
    fetchSnippets,
    saveSnippet,
    updateSnippet,
    deleteSnippet,
  };
};

export default useSnippets;
