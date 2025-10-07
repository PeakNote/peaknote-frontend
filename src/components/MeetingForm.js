import React, { useState } from 'react';
import './MeetingForm.css';

const MeetingForm = ({ onSubmit }) => {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // 解析内容，如果是JSON字符串则解析为对象
  const parseContent = (content) => {
    if (typeof content === 'string') {
      try {
        // 尝试解析JSON字符串
        const parsed = JSON.parse(content);
        return parsed;
      } catch (e) {
        // 如果不是JSON，返回原始字符串
        return content;
      }
    }
    return content;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Use the meeting URL directly as it should already be properly encoded
      const apiUrl = `https://api.peak-note.com/transcript/by-url?url=${meetingUrl}`;
      // const apiUrl = `https://4dd3f18734a3.ngrok-free.app/transcript/by-url?url=${meetingUrl}`;

      console.log('Calling API:', apiUrl); // 调试信息
      console.log('Meeting URL being sent:', meetingUrl);
      
      // Call transcript API
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' // Add ngrok header to skip browser warning
        }
      });

      console.log('MeetingForm response status:', response.status);
      console.log('MeetingForm response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`API Error ${response.status}: ${response.statusText}. Details: ${errorText}`);
      }

      const transcriptData = await response.json();
      console.log('MeetingForm API response:', transcriptData);
      console.log('MeetingDetails content:', transcriptData.meetingDetails);

      // Structure the data to match what the app expects
      let notes = '';
      
      // Check what's actually in meetingDetails
      if (transcriptData.meetingDetails) {
        // Try different possible fields for the content
        if (transcriptData.meetingDetails.transcript) {
          notes = parseContent(transcriptData.meetingDetails.transcript);
        } else if (transcriptData.meetingDetails.content) {
          notes = parseContent(transcriptData.meetingDetails.content);
        } else if (transcriptData.meetingDetails.summary) {
          notes = parseContent(transcriptData.meetingDetails.summary);
        } else if (transcriptData.meetingDetails.notes) {
          notes = parseContent(transcriptData.meetingDetails.notes);
        } else {
          // If none of the above, use the entire meetingDetails object
          notes = JSON.stringify(transcriptData.meetingDetails, null, 2);
        }
      } else {
        // Fallback to the entire response
        notes = JSON.stringify(transcriptData, null, 2);
      }

      // Check if notes is wrapped in markdown code block
      if (typeof notes === 'string' && notes.includes('```json')) {
        console.log('Detected JSON wrapped in markdown code block');
        try {
          // Extract JSON from markdown code block
          const jsonMatch = notes.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            const jsonString = jsonMatch[1].trim();
            console.log('Extracted JSON string:', jsonString.substring(0, 200) + '...');
            notes = JSON.parse(jsonString);
            console.log('Successfully parsed JSON:', notes);
            
            // Fix taskItem structure if needed
            if (notes && notes.content) {
              notes.content = notes.content.map(item => {
                if (item.type === 'taskList' && item.content) {
                  item.content = item.content.map(taskItem => {
                    if (taskItem.type === 'taskItem' && taskItem.content) {
                      // Check if taskItem content is direct text nodes
                      const hasDirectText = taskItem.content.some(node => node.type === 'text');
                      if (hasDirectText) {
                        // Wrap text nodes in paragraph
                        taskItem.content = [{
                          type: 'paragraph',
                          attrs: { textAlign: 'left' },
                          content: taskItem.content
                        }];
                      }
                    }
                    return taskItem;
                  });
                }
                return item;
              });
              console.log('Fixed taskItem structure:', notes);
            }
          }
        } catch (error) {
          console.error('Error parsing JSON from markdown:', error);
        }
      }
      // Convert HTML to Tiptap JSON format if needed
      else if (typeof notes === 'string' && notes.includes('<!DOCTYPE html>')) {
        console.log('Converting HTML to Tiptap format...');
        console.log('Original HTML content:', notes.substring(0, 200) + '...');
        
        // Parse HTML and convert to Tiptap format
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = notes;
        
        // Enhanced conversion: preserve HTML formatting
        const content = [];
        
        // Get all text content from the body
        const body = tempDiv.querySelector('body');
        if (body) {
          // Process all elements in order to maintain structure
          const processElement = (element) => {
            const nodeName = element.nodeName.toLowerCase();
            const textContent = element.textContent?.trim();
            
            if (!textContent) return null;
            
            // Handle text formatting within elements
            const processTextContent = (element) => {
              const textNodes = [];
              const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
                null,
                false
              );
              
              let node;
              while ((node = walker.nextNode())) {
                if (node.nodeType === Node.TEXT_NODE) {
                  const text = node.textContent?.trim();
                  if (text) {
                    textNodes.push({ type: 'text', text: text });
                  }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                  const tagName = node.nodeName.toLowerCase();
                  const text = node.textContent?.trim();
                  
                  if (text) {
                    switch (tagName) {
                      case 'strong':
                      case 'b':
                        textNodes.push({ 
                          type: 'text', 
                          marks: [{ type: 'bold' }], 
                          text: text 
                        });
                        break;
                      case 'em':
                      case 'i':
                        textNodes.push({ 
                          type: 'text', 
                          marks: [{ type: 'italic' }], 
                          text: text 
                        });
                        break;
                      case 'u':
                        textNodes.push({ 
                          type: 'text', 
                          marks: [{ type: 'underline' }], 
                          text: text 
                        });
                        break;
                      case 's':
                      case 'strike':
                        textNodes.push({ 
                          type: 'text', 
                          marks: [{ type: 'strike' }], 
                          text: text 
                        });
                        break;
                      case 'code':
                        textNodes.push({ 
                          type: 'text', 
                          marks: [{ type: 'code' }], 
                          text: text 
                        });
                        break;
                      default:
                        textNodes.push({ type: 'text', text: text });
                    }
                  }
                }
              }
              
              return textNodes.length > 0 ? textNodes : [{ type: 'text', text: textContent }];
            };
            
            switch (nodeName) {
              case 'h1':
                return {
                  type: 'heading',
                  attrs: { level: 1, textAlign: 'left' },
                  content: processTextContent(element)
                };
              case 'h2':
                return {
                  type: 'heading',
                  attrs: { level: 2, textAlign: 'left' },
                  content: processTextContent(element)
                };
              case 'h3':
                return {
                  type: 'heading',
                  attrs: { level: 3, textAlign: 'left' },
                  content: processTextContent(element)
                };
              case 'h4':
                return {
                  type: 'heading',
                  attrs: { level: 4, textAlign: 'left' },
                  content: processTextContent(element)
                };
              case 'h5':
                return {
                  type: 'heading',
                  attrs: { level: 5, textAlign: 'left' },
                  content: processTextContent(element)
                };
              case 'h6':
                return {
                  type: 'heading',
                  attrs: { level: 6, textAlign: 'left' },
                  content: processTextContent(element)
                };
              case 'p':
                return {
                  type: 'paragraph',
                  attrs: { textAlign: 'left' },
                  content: processTextContent(element)
                };
              case 'ul':
                const bulletItems = Array.from(element.querySelectorAll('li')).map(li => {
                  const textContent = processTextContent(li);
                  return {
                    type: 'listItem',
                    content: [{
                      type: 'paragraph',
                      attrs: { textAlign: 'left' },
                      content: textContent
                    }]
                  };
                }).filter(item => item.content[0].content.length > 0);
                
                return bulletItems.length > 0 ? {
                  type: 'bulletList',
                  content: bulletItems
                } : null;
              case 'ol':
                const orderedItems = Array.from(element.querySelectorAll('li')).map(li => {
                  const textContent = processTextContent(li);
                  return {
                    type: 'listItem',
                    content: [{
                      type: 'paragraph',
                      attrs: { textAlign: 'left' },
                      content: textContent
                    }]
                  };
                }).filter(item => item.content[0].content.length > 0);
                
                return orderedItems.length > 0 ? {
                  type: 'orderedList',
                  content: orderedItems
                } : null;
              case 'blockquote':
                return {
                  type: 'blockquote',
                  content: [{
                    type: 'paragraph',
                    attrs: { textAlign: 'left' },
                    content: processTextContent(element)
                  }]
                };
              case 'pre':
                return {
                  type: 'codeBlock',
                  attrs: { language: null },
                  content: [{
                    type: 'text',
                    text: textContent
                  }]
                };
              case 'hr':
                return {
                  type: 'horizontalRule'
                };
              case 'div':
                // For divs, check if they contain meaningful content
                const children = Array.from(element.children).map(child => processElement(child)).filter(Boolean);
                if (children.length > 0) {
                  return children;
                }
                // If div has text content but no children, treat as paragraph
                if (textContent && element.children.length === 0) {
                  return {
                    type: 'paragraph',
                    attrs: { textAlign: 'left' },
                    content: processTextContent(element)
                  };
                }
                return null;
              default:
                // For other elements, try to extract meaningful content
                if (element.children.length === 0 && textContent) {
                  return {
                    type: 'paragraph',
                    attrs: { textAlign: 'left' },
                    content: processTextContent(element)
                  };
                }
                return null;
            }
          };
          
          // Process all elements in the body
          const allElements = body.querySelectorAll('*');
          const processedElements = new Set();
          
          allElements.forEach(element => {
            if (!processedElements.has(element)) {
              const result = processElement(element);
              if (result) {
                if (Array.isArray(result)) {
                  content.push(...result);
                } else {
                  content.push(result);
                }
                // Mark this element and its children as processed
                processedElements.add(element);
                const children = element.querySelectorAll('*');
                children.forEach(child => processedElements.add(child));
              }
            }
          });
        }
        
        // If no content was extracted, fallback to simple text
        if (content.length === 0) {
          const textContent = tempDiv.textContent || tempDiv.innerText || '';
          content.push({
            type: 'paragraph',
            attrs: { textAlign: 'left' },
            content: [{ type: 'text', text: textContent }]
          });
        }
        
        notes = {
          type: 'doc',
          content: content
        };
        
        console.log('Converted Tiptap JSON with formatting:', notes);
        console.log('Content array details:', notes.content);
      }

      const formattedData = {
        meetingUrl,
        template: 'smart',
        notes: notes,
        generatedAt: new Date().toISOString(),
        // 添加API返回的meetingList和eventId
        meetingList: transcriptData.meetingList || [],
        currentEventId: transcriptData.meetingDetails?.eventId || null
      };

      console.log('MeetingForm: Sending formatted data:', formattedData);
      onSubmit(formattedData);
    } catch (error) {
      console.error('Error generating meeting transcript:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        meetingUrl: meetingUrl,
        apiUrl: `https://4dd3f18734a3.ngrok-free.app/transcript/by-url?url=${meetingUrl}`
      });
      
      // Show more specific error message
      const errorMessage = error.message.includes('API Error') 
        ? `API Error: ${error.message}` 
        : `Error: ${error.message}. Please check the console for details.`;
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
      setIsFinished(true);
    }
  };

  const handleUrlChange = (e) => {
    setMeetingUrl(e.target.value);
    setIsFinished(false);
  };

  return (
    <div className="card shadow p-4 meeting-form-container">
      <form onSubmit={handleSubmit}>
        <div className="mb-3 row">  
            <input
              type="url"
              className="form-control"
              id="teams-url"
              placeholder="Enter Teams meeting URL"
              value={meetingUrl}
              onChange={handleUrlChange}
              required
            /> 
        </div>
        <button
          type="submit"
          className={`btn btn-primary${isProcessing ? ' btn-processing' : ''}${isFinished ? ' btn-finished' : ''}`}
          disabled={isProcessing}
        >
          <span style={{ position: 'relative', zIndex: 2 }}>
            {isProcessing ? 'Generating...' : 'Generate Notes'}
          </span>
        </button>
      </form>
    </div>
  );
};

export default MeetingForm;
