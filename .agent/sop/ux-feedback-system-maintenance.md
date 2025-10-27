# 🎨 UX Feedback System - Maintenance SOP

## Overview
Standard Operating Procedures for maintaining and extending the Claude Code-style UX feedback system implemented in Grok CLI.

## System Components

### **Core Files** (DO NOT MODIFY without testing)
- `src/ui/colors.ts` - Central color palette and consistency functions
- `src/services/ui-state.ts` - Event bus and state coordination
- `src/ui/components/banner.tsx` - Professional welcome banner system
- `src/ui/components/loading-spinner.tsx` - Contextual spinner system
- `src/ui/components/progress-indicator.tsx` - Progress tracking components
- `src/ui/components/background-activity.tsx` - Non-intrusive activity monitoring

### **Integration Points**
- `src/ui/components/chat-interface.tsx` - Main UI integration
- `src/hooks/use-enhanced-feedback.ts` - React integration hooks

## Color System Maintenance

### **DO: Color Consistency**
```typescript
// ✅ Use centralized color constants
import { inkColors } from '../colors.js';
<Text color={inkColors.success}>Success message</Text>

// ✅ Use semantic color functions
const spinnerColor = getSpinnerColor('search'); // Returns 'info'
```

### **DON'T: Hard-coded Colors**
```typescript
// ❌ Don't hard-code colors
<Text color="green">Success message</Text>

// ❌ Don't bypass color system
<Text color="#00FF00">Success message</Text>
```

### **Color Mapping Standards**
- **Blue/Cyan** (`info`): Search, indexing, system information
- **Green** (`success`): File writing, completed operations
- **Yellow/Orange** (`warning`): Processing states, work in progress
- **Red** (`error`): Error states, failed operations
- **Magenta** (`accent`): Special states, memory operations, compaction
- **Gray** (`muted`): Secondary information, timestamps, disabled states

## Spinner System Guidelines

### **Adding New Operation Types**
```typescript
// 1. Add to operationConfig in loading-spinner.tsx
const operationConfig = {
  // ... existing operations
  newOperation: {
    icon: '🔧',
    spinner: '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏',
    messages: ['Processing...', 'Working...', 'Computing...']
  }
};

// 2. Update LoadingSpinnerProps type
interface LoadingSpinnerProps {
  operation?: 'thinking' | 'search' | 'newOperation' | ...;
}

// 3. Add color mapping in colors.ts
export function getSpinnerColor(operation: string) {
  switch (operation.toLowerCase()) {
    case 'newoperation':
      return 'warning'; // Choose appropriate color
    // ... existing cases
  }
}
```

### **Spinner Usage Patterns**
```typescript
// ✅ Use with UI state service
uiState.startSpinner({
  operation: 'search',
  message: 'Scanning workspace...'
});

// ✅ Update progress dynamically
uiState.updateSpinner({
  progress: 75,
  message: 'Almost done...'
});

// ✅ Stop when complete
uiState.stopSpinner();
```

## Progress Indicator Guidelines

### **Progress Bar Standards**
- **Length**: 25 characters for optimal terminal display
- **Fill Character**: `█` for filled sections, `░` for empty
- **Update Frequency**: Max 10Hz (every 100ms) to avoid UI flooding
- **ETA Calculation**: Only show for operations >30 seconds estimated

### **Progress Component Usage**
```typescript
// ✅ Proper progress tracking
<ProgressIndicator
  operation="indexing"
  current={47}
  total={150}
  message="Indexing workspace files..."
  showETA={true}
  startTime={Date.now()}
/>

// ✅ Token compaction progress
<TokenCompactionProgress
  isActive={true}
  usedTokens={4000}
  maxTokens={3000}
  compactedTokens={2500}
/>
```

## Background Activity Patterns

### **Activity Lifecycle**
```typescript
// 1. Start background activity
uiState.startBackgroundActivity('workspace-indexing', {
  activity: 'indexing',
  details: '0/150 files'
});

// 2. Update progress
uiState.updateBackgroundActivity('workspace-indexing', {
  details: '47/150 files',
  progress: { current: 47, total: 150 }
});

// 3. Complete activity
uiState.stopBackgroundActivity('workspace-indexing');
```

### **Activity Display Guidelines**
- **Position**: Use `position="corner"` for non-intrusive monitoring
- **Frequency**: Update max once per second to avoid distraction
- **Content**: Keep details concise (≤20 characters)
- **Auto-dismiss**: Remove when operation completes

## UI State Management

### **Event Naming Convention**
```typescript
// Pattern: [category]:[component]:[action]
'spinner:start'           // Spinner started
'progress:update'         // Progress updated
'background:indexing:complete'  // Background indexing finished
'notification:show'       // Notification displayed
```

### **State Coordination Patterns**
```typescript
// ✅ Use event-driven coordination
uiState.on('progress:update', ({ id, current, total }) => {
  if (id === 'workspace-indexing') {
    updateBanner({ indexProgress: current / total });
  }
});

// ✅ Clean up listeners
useEffect(() => {
  const unsubscribe = uiState.on('spinner:start', handleSpinnerStart);
  return unsubscribe;
}, []);
```

## Animation Performance

### **Timing Standards**
- **Spinner Animation**: 120ms intervals (8.33 FPS) for smooth motion
- **Pulse Effects**: 1.5s cycle for calm breathing rhythm
- **Progress Updates**: 50ms minimum interval for real-time feel
- **Transition Effects**: 200ms ease-in-out for state changes

### **Performance Guidelines**
```typescript
// ✅ Use requestAnimationFrame for smooth animation
useEffect(() => {
  if (!isActive) return;
  
  const interval = setInterval(() => {
    setSpinnerIndex(prev => (prev + 1) % 10);
  }, 120); // 120ms for 8.33 FPS
  
  return () => clearInterval(interval);
}, [isActive]);

// ❌ Don't use high-frequency updates
setInterval(updateSpinner, 16); // 60 FPS is unnecessary
```

## Testing UX Components

### **Visual Testing Checklist**
- [ ] **Color Consistency**: All components use centralized color system
- [ ] **Animation Smoothness**: No jerky or inconsistent motion
- [ ] **Terminal Compatibility**: Graceful degradation in limited-color terminals
- [ ] **Resource Usage**: <1% CPU impact for animations
- [ ] **Accessibility**: Icons supplement color coding

### **Manual Testing Commands**
```bash
# Test spinner system
npm run build && echo "exit" | node dist/index.js

# Test with different operations
GROK_UX_DEBUG=true npm run dev

# Test minimal mode
GROK_UX_MINIMAL=true npm run dev
```

## Troubleshooting

### **Common Issues**

#### **Spinner Not Appearing**
```typescript
// Check UI state service initialization
console.log(uiState.getCurrentSpinner()); // Should show active spinner

// Verify event listeners
uiState.listenerCount('spinner:start'); // Should be > 0
```

#### **Color Inconsistency**
```typescript
// Verify color imports
import { inkColors } from '../colors.js'; // Check path
console.log(inkColors.success); // Should be 'green'
```

#### **Performance Issues**
```typescript
// Check animation frequency
const ANIMATION_INTERVAL = 120; // Should be ≥100ms
const PULSE_CYCLE = 1500; // Should be ≥1000ms
```

### **Debug Mode**
```bash
# Enable UX debug logging
export GROK_UX_DEBUG=true

# Disable all enhancements for testing
export GROK_UX_ENHANCED=false

# Minimal mode for performance testing
export GROK_UX_MINIMAL=true
```

## Extension Guidelines

### **Adding New Feedback Types**
1. **Define in UI state service** with appropriate event types
2. **Create component** following existing patterns
3. **Add color mapping** in colors.ts
4. **Update integration hooks** for easy usage
5. **Test with manual scenarios** and edge cases
6. **Document in this SOP** for future maintenance

### **Backwards Compatibility**
- All UX enhancements must be **optional by default**
- Provide **graceful degradation** for unsupported terminals
- Maintain **existing API compatibility** for tools and services
- Use **feature flags** for experimental enhancements

## Quality Gates

### **Before Committing UX Changes**
- [ ] TypeScript compilation passes
- [ ] All existing tests still pass
- [ ] Manual testing in terminal
- [ ] Performance impact measured (<1% CPU)
- [ ] Color consistency verified
- [ ] Animation smoothness confirmed
- [ ] Documentation updated

### **Code Review Checklist**
- [ ] Uses centralized color system
- [ ] Follows animation performance guidelines
- [ ] Includes proper event cleanup
- [ ] Has appropriate error handling
- [ ] Maintains accessibility standards
- [ ] Includes debug/testing support

This SOP ensures the UX feedback system remains professional, performant, and maintainable while enabling future enhancements.