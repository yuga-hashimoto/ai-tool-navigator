'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import './AdminChatStyles.css';

interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface CannedResponsesProps {
  category?: string;
  onSelect: (response: string) => void;
  onClose: () => void;
}

export default function CannedResponses({ category, onSelect, onClose }: CannedResponsesProps) {
  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<CannedResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await fetch('/api/chat/canned-responses');
        const data = await response.json();
        
        if (data.success) {
          setResponses(data.data);
          setFilteredResponses(data.data);
        }
      } catch (error) {
        console.error('Error fetching canned responses:', error);
      }
    };

    fetchResponses();
  }, []);

  useEffect(() => {
    let filtered = responses;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.title.toLowerCase().includes(query) ||
          r.content.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    setFilteredResponses(filtered);
  }, [searchQuery, selectedCategory, responses]);

  const categories = ['all', ...new Set(responses.map(r => r.category))];

  return (
    <div className="canned-responses-panel">
      <div className="panel-header">
        <h3>Quick Responses</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="panel-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search responses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="responses-list">
        {filteredResponses.length === 0 ? (
          <div className="empty-state">No responses found</div>
        ) : (
          filteredResponses.map(response => (
            <div
              key={response.id}
              className="response-item"
              onClick={() => onSelect(response.content)}
            >
              <div className="response-title">{response.title}</div>
              <div className="response-preview">
                {response.content.substring(0, 80)}
                {response.content.length > 80 && '...'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
