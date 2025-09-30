import { useState, useEffect, useRef, useCallback } from 'react';
import { updateTranscript } from '../services/transcriptService';

// 版本历史管理
const useVersionHistory = (maxVersions = 10) => {
  const [versions, setVersions] = useState([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);

  const addVersion = useCallback((content) => {
    const newVersion = {
      id: Date.now(),
      content: JSON.parse(JSON.stringify(content)), // 深拷贝
      timestamp: new Date().toISOString(),
      description: `版本 ${versions.length + 1}`
    };

    setVersions(prev => {
      const newVersions = [...prev, newVersion];
      // 只保留最近的maxVersions个版本
      if (newVersions.length > maxVersions) {
        return newVersions.slice(-maxVersions);
      }
      return newVersions;
    });

    setCurrentVersionIndex(prev => Math.min(prev + 1, maxVersions - 1));
  }, [maxVersions, versions.length]);

  const undo = useCallback(() => {
    if (currentVersionIndex > 0) {
      setCurrentVersionIndex(prev => prev - 1);
      return versions[currentVersionIndex - 1]?.content;
    }
    return null;
  }, [currentVersionIndex, versions]);

  const redo = useCallback(() => {
    if (currentVersionIndex < versions.length - 1) {
      setCurrentVersionIndex(prev => prev + 1);
      return versions[currentVersionIndex + 1]?.content;
    }
    return null;
  }, [currentVersionIndex, versions]);

  const getCurrentVersion = useCallback(() => {
    return versions[currentVersionIndex]?.content || null;
  }, [currentVersionIndex, versions]);

  const canUndo = currentVersionIndex > 0;
  const canRedo = currentVersionIndex < versions.length - 1;

  return {
    versions,
    addVersion,
    undo,
    redo,
    getCurrentVersion,
    canUndo,
    canRedo,
    currentVersionIndex
  };
};

// 自动保存hook
export const useAutoSave = (content, eventId, options = {}) => {
  const {
    saveInterval = 10000, // 10秒
    debounceDelay = 2000, // 输入停止后2秒
    maxVersions = 10
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [error, setError] = useState(null);

  const saveTimeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const lastContentRef = useRef(null);
  const isInitializedRef = useRef(false);

  // 版本历史管理
  const versionHistory = useVersionHistory(maxVersions);

  // 检查内容是否有变化
  const hasContentChanged = useCallback((newContent, oldContent) => {
    if (!oldContent || !newContent) return true;
    return JSON.stringify(newContent) !== JSON.stringify(oldContent);
  }, []);

  // 保存到后端（带重试机制）
  const saveToBackend = useCallback(async (contentToSave, retryCount = 0) => {
    if (!eventId || !contentToSave) {
      console.log('🚫 Auto-save skipped: missing eventId or content', { eventId, hasContent: !!contentToSave });
      return;
    }

    const maxRetries = 2;
    console.log(`💾 Auto-saving content... (attempt ${retryCount + 1}/${maxRetries + 1})`, { eventId, hasContent: !!contentToSave });
    setIsSaving(true);
    setSaveStatus('saving');
    setError(null);

    try {
      await updateTranscript(eventId, contentToSave);
      setLastSaved(new Date().toISOString());
      setSaveStatus('saved');
      
      // 更新本地缓存
      localStorage.setItem(`meeting_${eventId}_latest`, JSON.stringify(contentToSave));
      
      // 更新参考内容，标记为已保存
      lastContentRef.current = JSON.parse(JSON.stringify(contentToSave));
      console.log('✅ Auto-save successful and cached locally');
    } catch (err) {
      console.error(`❌ Auto-save failed (attempt ${retryCount + 1}):`, err.message);
      
      // 如果是服务器错误且还有重试次数，则重试
      if (err.message.includes('500') && retryCount < maxRetries) {
        console.log(`🔄 Retrying save in 2 seconds... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          saveToBackend(contentToSave, retryCount + 1);
        }, 2000);
        return;
      }
      
      // 最终失败，更新状态
      setError(err.message);
      setSaveStatus('error');
      
      // 即使服务器保存失败，也更新本地缓存
      localStorage.setItem(`meeting_${eventId}_latest`, JSON.stringify(contentToSave));
      console.log('💾 Content cached locally despite server error');
      console.log('⚠️ 服务器暂时不可用，内容已保存到本地缓存');
    } finally {
      if (retryCount === 0) {
        setIsSaving(false);
      }
    }
  }, [eventId]);

  // 防抖保存
  const debouncedSave = useCallback((contentToSave) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (hasContentChanged(contentToSave, lastContentRef.current)) {
        console.log('🔄 Content changed, triggering debounced save');
        saveToBackend(contentToSave);
        // lastContentRef 将在 saveToBackend 成功后更新
      }
    }, debounceDelay);
  }, [debounceDelay, hasContentChanged, saveToBackend]);

  // 定期保存
  const startPeriodicSave = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (content && hasContentChanged(content, lastContentRef.current)) {
        console.log('🔄 Periodic save triggered - content changed');
        saveToBackend(content);
        // lastContentRef 将在 saveToBackend 成功后更新
      }
    }, saveInterval);
  }, [content, saveInterval, hasContentChanged, saveToBackend]);

  // 停止定期保存
  const stopPeriodicSave = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 监听eventId变化，重置自动保存状态
  useEffect(() => {
    if (eventId) {
      console.log('🔄 EventId changed, resetting auto-save state:', eventId);
      // 重置初始化状态
      isInitializedRef.current = false;
      // 重置参考内容，避免和之前会议的内容比较
      lastContentRef.current = null;
      // 清除之前的定时器
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    }
  }, [eventId]);

  // 监听内容变化
  useEffect(() => {
    if (!content || !eventId) {
      return;
    }

    // 初始化时添加版本
    if (!isInitializedRef.current) {
      console.log('🆕 Initializing auto-save for new eventId:', eventId);
      versionHistory.addVersion(content);
      lastContentRef.current = JSON.parse(JSON.stringify(content));
      isInitializedRef.current = true;
      return;
    }

    // 检查内容是否有变化
    if (hasContentChanged(content, lastContentRef.current)) {
      // 添加新版本到历史记录
      versionHistory.addVersion(content);
      
      // 防抖保存
      debouncedSave(content);
    }
  }, [content, eventId, hasContentChanged, debouncedSave, versionHistory]);

  // 启动定期保存
  useEffect(() => {
    if (eventId && content) {
      startPeriodicSave();
    }

    return () => {
      stopPeriodicSave();
    };
  }, [eventId, content, startPeriodicSave, stopPeriodicSave]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 手动保存
  const manualSave = useCallback(async () => {
    if (!content || !eventId) {
      return;
    }
    
    await saveToBackend(content);
    versionHistory.addVersion(content);
    lastContentRef.current = JSON.parse(JSON.stringify(content));
  }, [content, eventId, saveToBackend, versionHistory]);

  // 撤销
  const undo = useCallback(() => {
    const previousContent = versionHistory.undo();
    if (previousContent) {
      lastContentRef.current = JSON.parse(JSON.stringify(previousContent));
      return previousContent;
    }
    return null;
  }, [versionHistory]);

  // 重做
  const redo = useCallback(() => {
    const nextContent = versionHistory.redo();
    if (nextContent) {
      lastContentRef.current = JSON.parse(JSON.stringify(nextContent));
      return nextContent;
    }
    return null;
  }, [versionHistory]);

  // 检查是否有未保存的更改
  const hasUnsavedChanges = useCallback(() => {
    // 如果还没有初始化（刚切换会议），不应该认为有未保存的更改
    if (!isInitializedRef.current) {
      console.log('🔍 hasUnsavedChanges: 未初始化，返回 false');
      return false;
    }
    
    if (!content || !lastContentRef.current) {
      console.log('🔍 hasUnsavedChanges: 缺少内容或参考内容', {
        hasContent: !!content,
        hasLastContent: !!lastContentRef.current
      });
      return false;
    }
    
    const hasChanges = hasContentChanged(content, lastContentRef.current);
    console.log('🔍 hasUnsavedChanges 检查:', {
      hasChanges,
      contentPreview: JSON.stringify(content).substring(0, 100) + '...',
      lastContentPreview: JSON.stringify(lastContentRef.current).substring(0, 100) + '...'
    });
    
    return hasChanges;
  }, [content, hasContentChanged]);

  return {
    isSaving,
    lastSaved,
    saveStatus,
    error,
    manualSave,
    undo,
    redo,
    canUndo: versionHistory.canUndo,
    canRedo: versionHistory.canRedo,
    versions: versionHistory.versions,
    currentVersionIndex: versionHistory.currentVersionIndex,
    hasUnsavedChanges
  };
};
