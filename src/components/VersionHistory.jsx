import React, { useState } from 'react';
import './VersionHistory.css';

const VersionHistory = ({ 
  versions, 
  currentVersionIndex, 
  onRestore, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo,
  isOpen,
  onClose 
}) => {
  const [selectedVersion, setSelectedVersion] = useState(null);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getContentPreview = (content) => {
    if (!content || !content.content) return '空内容';
    
    // 提取前100个字符作为预览
    const extractText = (node) => {
      if (node.type === 'text') return node.text || '';
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join('');
      }
      return '';
    };

    const text = content.content.map(extractText).join('').substring(0, 100);
    return text || '空内容';
  };

  const handleRestore = (version) => {
    if (onRestore) {
      onRestore(version.content);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="version-history-overlay">
      <div className="version-history-modal">
        <div className="version-history-header">
          <h3>版本历史</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="version-history-controls">
          <button 
            className="control-btn undo-btn" 
            onClick={onUndo} 
            disabled={!canUndo}
            title="撤销 (Ctrl+Z)"
          >
            ↶ 撤销
          </button>
          <button 
            className="control-btn redo-btn" 
            onClick={onRedo} 
            disabled={!canRedo}
            title="重做 (Ctrl+Y)"
          >
            ↷ 重做
          </button>
        </div>

        <div className="version-history-list">
          {versions.map((version, index) => (
            <div 
              key={version.id}
              className={`version-item ${index === currentVersionIndex ? 'current' : ''} ${selectedVersion === version.id ? 'selected' : ''}`}
              onClick={() => setSelectedVersion(version.id)}
            >
              <div className="version-header">
                <span className="version-title">{version.description}</span>
                <span className="version-time">{formatTime(version.timestamp)}</span>
              </div>
              <div className="version-preview">
                {getContentPreview(version.content)}
              </div>
              {index === currentVersionIndex && (
                <div className="current-badge">当前版本</div>
              )}
            </div>
          ))}
        </div>

        <div className="version-history-actions">
          <button 
            className="action-btn restore-btn"
            onClick={() => selectedVersion && handleRestore(versions.find(v => v.id === selectedVersion))}
            disabled={!selectedVersion || selectedVersion === versions[currentVersionIndex]?.id}
          >
            恢复此版本
          </button>
          <button className="action-btn cancel-btn" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;
