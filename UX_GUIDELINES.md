# Hireloop UX/Design Guidelines

> **Mission**: Make every interaction feel intentional, smooth, and alive. The application should feel premium, responsive, and delightful to use.

## Core Principles

### 1. Micro-Interactions 🎯
Every interactive element should provide immediate visual feedback.

**Implementation Standards:**
- **Hover States**: Subtle scale, color shift, or shadow changes
- **Tap/Click States**: Brief scale-down effect on press
- **Focus States**: Clear outline or background change for accessibility
- **Transitions**: 150-300ms duration for most interactions
- **Disabled States**: Reduced opacity (50%) with cursor-not-allowed

**Examples:**
```tsx
// Button hover with multiple effects
className="transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"

// Card hover with lift effect
className="transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"

// Input focus ring
className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
```

---

### 2. Loading States 📊
Never leave users wondering if something is happening.

**Loading Hierarchy:**
1. **Skeleton Loaders** (preferred) - Show content structure while loading
2. **Shimmer Effects** - Add animated shimmer to skeletons for visual interest
3. **Spinners** - Use for actions, not initial page loads
4. **Progress Bars** - For multi-step processes or file uploads

**Implementation:**
```tsx
// Skeleton with shimmer
<div className="animate-pulse">
  <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 
                  animate-shimmer rounded"></div>
</div>

// Smart loading states
{isLoading ? <SkeletonLoader /> : <ActualContent />}
```

---

### 3. Empty States 🎨
Turn "no data" into an opportunity for engagement.

**Requirements:**
- **Icon/Illustration**: Visually represent what's missing
- **Clear Title**: What's empty
- **Helpful Description**: Why it's empty or what to do next
- **Call-to-Action**: Button to create first item (when applicable)
- **Friendly Tone**: Encouraging, not corporate

**Example:**
```tsx
<EmptyState
  icon={Inbox}
  title="No candidates yet"
  description="Import résumés or post your first job to start building your pipeline"
  action={{ label: "Create Job", onClick: () => navigate('/jobs/new') }}
/>
```

---

### 4. Animations & Transitions 🌊

**Page Transitions:**
- Fade in on mount: `animate-fade-in`
- Slide in from bottom: `animate-slide-up`
- Stagger list items: Use `animation-delay` incrementally

**Modal Behavior:**
- Backdrop: Fade from 0 to full opacity
- Content: Scale from 0.95 to 1.0 + fade in
- Close: Reverse animation before unmount

**Chart Animations:**
- Bars/lines should animate from 0 to value on mount
- Legend items appear with stagger effect
- Tooltips fade in on hover

**Timing Standards:**
- Page transitions: 300ms
- Modal open/close: 200ms
- Tooltip: 150ms
- Micro-interactions: 150-200ms

---

### 5. Responsive Design 📱

**Breakpoints (Tailwind):**
- `sm`: 640px - Small tablets portrait
- `md`: 768px - Tablets landscape
- `lg`: 1024px - Laptops
- `xl`: 1280px - Desktops
- `2xl`: 1536px - Large desktops

**Mobile-First Approach:**
```tsx
// Stack on mobile, side-by-side on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Touch Targets:**
- Minimum 44x44px for mobile buttons/links
- Adequate spacing between interactive elements
- Swipe gestures for modals on mobile (nice-to-have)

**Responsive Typography:**
```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

---

### 6. Dynamic Behavior ⚡

**Live Updates:**
- Charts update smoothly when data changes (no flicker)
- Counters animate when values change
- Auto-refresh indicators show when data is being fetched
- Optimistic UI updates for better perceived performance

**Interactive Filters:**
- Instant visual feedback as filters change
- Loading states during filter application
- Result count updates live
- Clear all filters option always visible

**Real-time Features:**
- Toast notifications for background updates
- Badge counts update live (e.g., new candidates)
- Status changes reflect immediately
- Collaborative indicators (if multiple users)

---

### 7. Feedback & Notifications 🔔

**Toast Patterns:**
- **Success**: Green with checkmark, auto-dismiss in 3s
- **Error**: Red with X, manual dismiss
- **Info**: Blue with info icon, auto-dismiss in 5s
- **Warning**: Yellow with warning icon, manual dismiss

**Position**: Top-right for desktop, top-center for mobile

**Best Practices:**
- Keep messages concise (< 60 characters)
- Use action-oriented language
- Include undo option when applicable
- Stack multiple toasts vertically

---

### 8. Error States 🚨

**Error Hierarchy:**
1. **Inline errors**: Field validation (show on blur or submit)
2. **Section errors**: API failures affecting a component
3. **Page errors**: Fatal errors, network issues
4. **Global errors**: Auth failures, server down

**Error Messages:**
- **What happened**: Clear description
- **Why it happened**: When helpful
- **What to do**: Next steps or retry action
- **Contact support**: For critical errors

**Visual Treatment:**
```tsx
<div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
  <div className="flex items-start gap-3">
    <XCircle className="h-5 w-5 text-red-600" />
    <div>
      <h4 className="font-medium text-red-900">Error message</h4>
      <p className="text-sm text-red-700">Description and action</p>
    </div>
  </div>
</div>
```

---

## Animation Library

### Custom Tailwind Animations

Add to `tailwind.config.js`:

```javascript
theme: {
  extend: {
    animation: {
      'fade-in': 'fadeIn 0.3s ease-in',
      'slide-up': 'slideUp 0.3s ease-out',
      'slide-down': 'slideDown 0.3s ease-out',
      'shimmer': 'shimmer 2s infinite',
      'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideDown: {
        '0%': { transform: 'translateY(-10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      shimmer: {
        '0%': { backgroundPosition: '-1000px 0' },
        '100%': { backgroundPosition: '1000px 0' },
      },
      bounceSubtle: {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-5px)' },
      },
    },
  },
}
```

---

## Component Patterns

### Buttons

```tsx
// Primary CTA
<button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg
                   font-medium transition-all duration-200 
                   hover:shadow-lg hover:scale-105 active:scale-95
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">

// Secondary
<button className="border-2 border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg
                   font-medium transition-all duration-200
                   hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50
                   active:scale-95">

// Ghost
<button className="text-slate-600 px-4 py-2 rounded-lg
                   transition-colors duration-200
                   hover:bg-slate-100 hover:text-slate-900
                   active:bg-slate-200">
```

### Cards

```tsx
<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm
                transition-all duration-300
                hover:shadow-xl hover:-translate-y-1
                cursor-pointer">
```

### Inputs

```tsx
<input className="w-full px-4 py-2.5 rounded-lg border border-slate-300
                  transition-all duration-200
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                  placeholder:text-slate-400
                  disabled:bg-slate-50 disabled:text-slate-500" />
```

---

## Accessibility Requirements

- ✅ All interactive elements keyboard accessible
- ✅ Focus indicators visible and clear
- ✅ ARIA labels for icon-only buttons
- ✅ Color contrast ratio ≥ 4.5:1 for text
- ✅ Screen reader announcements for dynamic changes
- ✅ Skip navigation links
- ✅ Semantic HTML structure

---

## Performance Guidelines

- **Animations**: Use `transform` and `opacity` (GPU-accelerated)
- **Avoid**: Animating `width`, `height`, `top`,`left` (causes reflow)
- **Debounce**: Search inputs, resize handlers
- **Throttle**: Scroll handlers
- **Lazy Load**: Images, charts, heavy components below fold
- **Code Splitting**: Route-based code splitting

---

## Testing Checklist

### Visual Testing
- [ ] Test all breakpoints (mobile, tablet, desktop)
- [ ] Verify hover states on all interactive elements
- [ ] Check loading states appear correctly
- [ ] Validate empty states are helpful
- [ ] Ensure animations are smooth (60fps)

### Interaction Testing
- [ ] Keyboard navigation works throughout app
- [ ] Focus indicators are visible
- [ ] Forms show validation errors appropriately
- [ ] Toasts appear and dismiss correctly
- [ ] Modals can be closed multiple ways (X, ESC, backdrop)

### Performance Testing
- [ ] Page load < 2s on 3G
- [ ] Time to Interactive < 3s
- [ ] No layout shift on load
- [ ] Animations run at 60fps
- [ ] No memory leaks in SPAs

---

## Quick Reference

**Make it feel interactive and alive:**
- ✨ Smooth hover and tap states on all interactive elements
- 🎬 Animated page transitions and modal popups
- ⏳ Skeleton loaders and shimmer effects while data loads
- 📊 Live-updating charts when data changes
- 📱 Fully responsive for mobile, tablet, and desktop
- 🎯 Clear empty states, loading states, and error states
- 🔔 Toast notifications for all user actions
- ♿ Accessible to all users with keyboard and screen readers
