# Auto-Save Feature Testing Guide

## How to View Auto-Save Logs

The console now displays detailed auto-save logs, including:

### 🔍 Console Log Descriptions

#### 1. System Initialization Logs
```
🚀 Auto-save system activated! { eventId: "xxx", hasContent: true }
🎯 Initializing auto-save with first version...
```

#### 2. Content Change Detection Logs
```
📝 Content changed detected, adding new version and scheduling save...
⏱️ Setting debounced save timer (2 seconds)...
🔄 Content changed, triggering debounced save
```

#### 3. Periodic Save Logs
```
🔄 Starting periodic save (every 10 seconds)...
⏰ Periodic save check...
🔄 Content changed, triggering periodic save
```

#### 4. API Request Logs
```
🌐 Sending API request: { url: "...", eventId: "...", contentLength: 1234 }
📡 API response received: { status: 200, statusText: "OK", ok: true }
✅ API response content: ✅ success
```

#### 5. Save Status Logs
```
💾 Starting auto-save...
✅ Auto-save successful: 2024-01-01 12:00:00
```

### 🧪 Testing Steps

1. **Open Browser Developer Tools**
   - Press F12 or right-click and select "Inspect"
   - Switch to the Console tab

2. **Generate Meeting Notes**
   - Enter meeting URL and click "Generate Notes"
   - Observe if initialization logs appear in console

3. **Test Auto-Save**
   - Type some text in the editor
   - Observe if content change detection appears in console
   - Wait 2 seconds, observe if debounced save is triggered
   - Wait 10 seconds, observe if periodic save is triggered

4. **Test Manual Save**
   - Press Ctrl+S or click the save button
   - Observe if manual save logs appear in console

5. **Test Version History**
   - Click the 📚 button to view version history
   - Test undo/redo functionality

### 🔧 Debug Panel

In development mode, a debug panel appears in the top-left corner, containing:
- Save status information
- Version history statistics
- Action buttons
- Error messages (if any)

### 🚨 Common Issue Troubleshooting

#### Issue 1: No Auto-Save Logs Visible
**Possible Causes:**
- No meeting data or eventId
- Editor content is empty
- Network connection issues

**Solutions:**
- Ensure meeting notes have been generated
- Check console for error messages
- Review debug panel status information

#### Issue 2: Save Failure
**Possible Causes:**
- API server not started
- Network connection issues
- Backend interface errors

**Solutions:**
- Check if API URL is correct
- Verify network requests are successful
- Check backend service status

#### Issue 3: Version History Not Working
**Possible Causes:**
- Content hasn't changed
- Version count reached limit

**Solutions:**
- Ensure content has been edited
- Check version history panel

### 📊 Log Level Descriptions

- 🚀 System startup
- 📝 Content change
- ⏱️ Timer setup
- 🔄 Save triggered
- 💾 Save started
- ✅ Save successful
- ❌ Save failed
- 🌐 API request
- 📡 API response

### 🎯 Expected Behavior

Under normal circumstances, you should see:
1. Activation logs when system starts
2. Change detection logs when editing content
3. Debounced save logs after 2 seconds
4. Periodic save logs after 10 seconds
5. Detailed API request and response logs
6. Save success confirmation logs

If any step doesn't show expected logs, please check the console for error messages.
