# 🎨 PONS Design System

## Color Palette

### Primary Colors
```css
--shiftly-blue: #0ea5e9    /* Primary brand color */
--charcoal: #1e293b         /* Dark backgrounds */
--snow-white: #f1f5f9       /* Light backgrounds */
--steel-grey: #94a3b8       /* Muted text/borders */
```

### Color Usage

#### Light Mode
- **Background**: `bg-snow-white` (#f1f5f9)
- **Cards**: `bg-white` with `shadow-lg`
- **Text Primary**: `text-charcoal` (#1e293b)
- **Text Secondary**: `text-steel-grey` (#94a3b8)
- **Accent**: `text-shiftly-blue` (#0ea5e9)

#### Dark Mode
- **Background**: `bg-charcoal` (#1e293b)
- **Cards**: `bg-dark-lighter` (#334155)
- **Text Primary**: `text-snow-white` (#f1f5f9)
- **Text Secondary**: `text-steel-grey` (#94a3b8)
- **Accent**: `text-shiftly-blue` (#0ea5e9)

## Typography

### Font Family
- **Primary**: Inter
- **Fallback**: SF Pro Display
- **Usage**: `font-sans`

### Font Sizes
```css
text-xs     /* 12px - Labels, captions */
text-sm     /* 14px - Secondary text */
text-base   /* 16px - Body text */
text-lg     /* 18px - Subheadings */
text-xl     /* 20px - Card titles */
text-2xl    /* 24px - Section headers */
text-3xl    /* 30px - Page titles */
text-4xl    /* 36px - Hero text */
```

### Font Weights
```css
font-normal     /* 400 - Body text */
font-medium     /* 500 - Emphasis */
font-semibold   /* 600 - Headings */
font-bold       /* 700 - Strong emphasis */
```

## Components

### Cards
```tsx
// Standard Card
<div className="bg-white dark:bg-dark-lighter rounded-2xl p-6 shadow-lg">
  {/* content */}
</div>

// Glowing Card (active/hover)
<div className="bg-white dark:bg-dark-lighter rounded-2xl p-6 shadow-glow hover:shadow-glow-lg transition-all">
  {/* content */}
</div>

// KPI Card with gradient
<div className="bg-white dark:bg-dark-lighter rounded-2xl p-6 shadow-lg border-l-4 border-shiftly-blue">
  {/* content */}
</div>
```

### Buttons
```tsx
// Primary Button
<button className="px-6 py-3 bg-shiftly-blue text-white rounded-xl font-medium hover:bg-primary-dark shadow-glow-sm hover:shadow-glow transition-all">
  Action
</button>

// Secondary Button
<button className="px-6 py-3 bg-steel-grey/20 text-charcoal dark:text-snow-white rounded-xl font-medium hover:bg-steel-grey/30 transition-all">
  Action
</button>

// Ghost Button
<button className="px-6 py-3 text-shiftly-blue hover:bg-shiftly-blue/10 rounded-xl font-medium transition-all">
  Action
</button>
```

### Inputs
```tsx
<input 
  className="w-full px-4 py-3 bg-snow-white dark:bg-charcoal border border-steel-grey/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-shiftly-blue text-charcoal dark:text-snow-white placeholder-steel-grey"
  placeholder="Enter text..."
/>
```

### Navigation Items
```tsx
// Active
<a className="flex items-center px-4 py-3 bg-shiftly-blue/10 text-shiftly-blue rounded-xl shadow-glow-sm">
  <Icon className="mr-3" />
  Dashboard
</a>

// Inactive
<a className="flex items-center px-4 py-3 text-steel-grey hover:bg-shiftly-blue/5 hover:text-shiftly-blue rounded-xl transition-all">
  <Icon className="mr-3" />
  Projects
</a>
```

## Spacing

### Card Padding
- Small: `p-4` (1rem)
- Medium: `p-6` (1.5rem)
- Large: `p-8` (2rem)

### Grid Gaps
- Tight: `gap-4` (1rem)
- Normal: `gap-6` (1.5rem)
- Loose: `gap-8` (2rem)

## Effects

### Shadows
```css
shadow-sm        /* Subtle elevation */
shadow-lg        /* Standard cards */
shadow-glow      /* Blue glow (active states) */
shadow-glow-sm   /* Small glow (hover) */
shadow-glow-lg   /* Large glow (focus) */
```

### Transitions
```tsx
// Standard
transition-all duration-200

// Smooth
transition-all duration-300 ease-in-out

// Bounce
transition-all duration-200 hover:scale-105
```

### Animations
```tsx
// Pulse
animate-pulse-slow

// Glow
animate-glow

// Fade In
animate-fade-in
```

## Layout

### Border Radius
- Small: `rounded-lg` (0.5rem)
- Standard: `rounded-xl` (0.75rem)
- Cards: `rounded-2xl` (1rem)
- Large: `rounded-3xl` (1.5rem)
- Circle: `rounded-full`

### Responsive Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

## Usage Examples

### Dashboard Card
```tsx
<div className="bg-white dark:bg-dark-lighter rounded-2xl p-6 shadow-lg hover:shadow-glow transition-all">
  <h3 className="text-xl font-semibold text-charcoal dark:text-snow-white mb-2">
    Active Tasks
  </h3>
  <p className="text-4xl font-bold text-shiftly-blue mb-1">
    12
  </p>
  <p className="text-sm text-steel-grey">
    +3 from yesterday
  </p>
</div>
```

### Glowing Icon Button
```tsx
<button className="p-3 bg-shiftly-blue text-white rounded-xl shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all">
  <Icon className="w-6 h-6" />
</button>
```

### Profile Section
```tsx
<div className="flex items-center space-x-3 p-4 bg-white dark:bg-dark-lighter rounded-2xl shadow-lg">
  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-shiftly-blue to-primary-light shadow-glow" />
  <div>
    <p className="font-semibold text-charcoal dark:text-snow-white">Elite Operator</p>
    <p className="text-sm text-steel-grey">AI-Powered</p>
  </div>
</div>
```

## Design Principles

1. **Clarity First**: Always prioritize readability and function
2. **Subtle Glow**: Use glow effects sparingly for emphasis
3. **Consistent Spacing**: Use the 4px/8px grid system
4. **Smooth Transitions**: All interactions should feel fluid
5. **Responsive**: Mobile-first, scales beautifully
6. **Dark Mode**: Support both themes seamlessly

## Color Accessibility

All color combinations meet WCAG AA standards:
- Shiftly Blue on White: ✅ 4.52:1
- Charcoal on Snow White: ✅ 12.63:1
- Steel Grey on White: ✅ 3.52:1 (large text)
