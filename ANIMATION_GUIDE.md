# FleetFlow - Animation & Enhancement Implementation Guide

## 🎨 **New Animations Added**

### **Tailwind Animation Classes**

#### 1. **Slide & Fade Animations**
```tsx
// Slide up from bottom
<div className="animate-slide-up">Content</div>

// Slide right
<div className="animate-slide-in-right">Content</div>

// Fade in (already existed)
<div className="animate-fade-in">Content</div>
```

#### 2. **Entrance Animations**
```tsx
// Bounce in (elastic entrance)
<div className="animate-bounce-in">Content</div>

// Flip in (3D rotation entrance)
<div className="animate-flip-in">Content</div>

// Scale in (grow from small)
<div className="animate-scale-in">Content</div>
```

#### 3. **Glow & Pulse Effects**
```tsx
// Pulsing glow effect (perfect for important items)
<div className="animate-pulse-glow">Important Alert</div>

// Pulse (subtle oscillation)
<div className="animate-pulse">Loading...</div>

// Float (gentle up-down movement)
<div className="animate-float">Floating Element</div>
```

#### 4. **Special Effects**
```tsx
// Shimmer effect (skeleton loading)
<div className="animate-shimmer">Loading</div>

// Text shimmer (animated gradient text)
<div className="animate-shimmer-text text-gradient">Premium Text</div>

// Color shifting text
<div className="color-shift-text">Dynamic Text</div>
```

#### 5. **Chart Animations**
```tsx
// For recharts integration
<div className="animate-draw-chart">
  <YourChart />
</div>
```

---

## 🎯 **Stagger Pattern**

Use stagger classes to create cascading animations:

```tsx
<div className="animate-fade-in stagger-1">First item</div>
<div className="animate-fade-in stagger-2">Second item</div>
<div className="animate-fade-in stagger-3">Third item</div>
<div className="animate-fade-in stagger-4">Fourth item</div>
```

**Use cases:**
- Table rows entering one by one
- List items cascading
- Card staggering

---

## 💾 **Skeleton Loader Component**

NEW `<SkeletonLoader />` component for loading states:

### **Usage Examples**

```tsx
import { SkeletonLoader } from '@/components/SkeletonLoader';

// Loading a single card
<SkeletonLoader type="card" count={1} />

// Loading 5 table rows
<SkeletonLoader type="table" count={5} />

// Loading 10 list items
<SkeletonLoader type="list" count={10} />

// Loading a chart
<SkeletonLoader type="chart" />
```

### **With Conditional Rendering**

```tsx
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useState } from 'react';

export function MyComponent() {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setVehicles(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <SkeletonLoader type="table" count={5} />;
  }

  return (
    // Actual content with smooth fade-in
    <div className="animate-fade-in">
      {vehicles.map((v) => (
        <VehicleCard key={v.id} vehicle={v} />
      ))}
    </div>
  );
}
```

---

## 🎬 **Custom Hooks for Animation**

### **1. useAnimations()**

```tsx
import { useAnimations } from '@/hooks/use-animations';

export function MyComponent() {
  const { isAnimating, triggerAnimation } = useAnimations();

  return (
    <div>
      <button onClick={() => triggerAnimation(500)}>
        {isAnimating ? 'Animating...' : 'Start'}
      </button>
    </div>
  );
}
```

### **2. useCountUp()**

For animated number counters:

```tsx
import { useCountUp } from '@/hooks/use-animations';

export function StatsCard() {
  const vehicles = useCountUp(156, 1000); // Count to 156 in 1 second
  const trips = useCountUp(2340, 1500);
  
  return (
    <div>
      <div className="text-3xl font-bold">{vehicles}</div>
      <p className="text-muted-foreground">Active Vehicles</p>
    </div>
  );
}
```

### **3. useDataLoader()**

```tsx
import { useDataLoader } from '@/hooks/use-animations';

export function VehiclesPage() {
  const { data, loading, error } = useDataLoader(
    () => fetchVehicles(),
    []
  );

  if (loading) {
    return <SkeletonLoader type="table" count={5} />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="animate-fade-in">
      {/* Your component */}
    </div>
  );
}
```

### **4. useExportData()**

```tsx
import { useExportData } from '@/hooks/use-animations';

export function AnalyticsPage() {
  const { exportToCSV, exportToJSON, isExporting, exportProgress } =
    useExportData();

  return (
    <button onClick={() => exportToCSV(trips, 'trips-export')}>
      {isExporting ? `Exporting (${exportProgress}%)` : 'Export CSV'}
    </button>
  );
}
```

---

## 🧩 **CSS Utility Classes**

### **Smooth Transitions**
```tsx
// All transitions are smooth and snappy
<div className="smooth-transition hover:scale-105">
  Interactive element
</div>
```

### **Glow Effects**
```tsx
// Add glow to elements
<div className="glow-primary">Important card</div>
```

### **Existing Animation Helpers**

```tsx
// Slide up (for bottom entrance)
<div className="slide-in-bottom">Modal</div>

// Smooth appear
<div className="appear-smooth">Content</div>

// Floating animation
<div className="float-animation">Floating Button</div>
```

---

## 📝 **Implementation Examples**

### **Example 1: Enhanced Vehicle Table**

```tsx
export function VehiclesTable() {
  const [loading, setLoading] = useState(true);

  return (
    <div>
      <h2 className="text-2xl font-bold animate-fade-in">
        Vehicle Registry
      </h2>

      {loading ? (
        <SkeletonLoader type="table" count={5} />
      ) : (
        <table className="w-full">
          <tbody>
            {vehicles.map((v, i) => (
              <tr
                key={v.id}
                className={`animate-slide-up stagger-${i + 1}`}
              >
                {/* Cells */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

### **Example 2: Enhanced KPI Cards**

```tsx
export function DashboardKPIs() {
  const activeVehicles = useCountUp(145, 1000);
  const totalTrips = useCountUp(2840, 1200);

  return (
    <div className="grid grid-cols-4 gap-4">
      <div
        className="kpi-card animate-bounce-in"
        style={{ animationDelay: '0ms' }}
      >
        <p className="text-muted-foreground">Active Vehicles</p>
        <p className="text-3xl font-bold animate-color-shift">
          {activeVehicles}
        </p>
      </div>

      <div
        className="kpi-card animate-bounce-in"
        style={{ animationDelay: '100ms' }}
      >
        <p className="text-muted-foreground">Total Trips</p>
        <p className="text-3xl font-bold">{totalTrips}</p>
      </div>

      {/* More cards */}
    </div>
  );
}
```

### **Example 3: Animated Modals**

```tsx
<Dialog>
  <DialogContent className="animate-scale-in bg-background/80 backdrop-blur-xl">
    <DialogHeader>
      <DialogTitle className="animate-fade-in">
        Create New Trip
      </DialogTitle>
    </DialogHeader>
    
    <form className="space-y-4">
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        {/* First field */}
      </div>
      <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
        {/* Second field */}
      </div>
    </form>
  </DialogContent>
</Dialog>
```

---

## 🚀 **Best Practices**

### **✅ DO:**
- Use stagger for list items (creates sophistication)
- Use skeleton loaders while data loads
- Use subtle animations (don't overdo it)
- Match animation duration to action (fast for UI, slower for emphasis)
- Use `forwards` in animation fills to keep elements visible

### **❌ DON'T:**
- Animate every element (creates chaos)
- Use long durations (> 1 second) for UI interactions
- Animate on every interaction (reserve for important actions)
- Mix too many animation types on one page
- Use distracting animations on load

---

## 🎯 **Quick Implementation Checklist**

- [ ] Add skeleton loaders to loading states
- [ ] Use stagger for list/table rows
- [ ] Add number counters to KPI cards
- [ ] Use glow effects for important alerts
- [ ] Add slide-up animations to modals
- [ ] Use bounce-in for entrance animations
- [ ] Add float animation to floating action buttons
- [ ] Use color-shift for dynamic text
- [ ] Implement data loader hook for async operations

---

## 📚 **Available Animation Classes**

| Animation | Duration | Use Case |
|-----------|----------|----------|
| `animate-fade-in` | 0.5s | Page load, content reveal |
| `animate-slide-up` | 0.5s | Bottom entrance |
| `animate-slide-in-right` | 0.4s | Right side entrance |
| `animate-scale-in` | 0.3s | Modal entrance |
| `animate-bounce-in` | 0.6s | Attention grabber |
| `animate-flip-in` | 0.6s | Card flip |
| `animate-pulse-glow` | 2s | Important alerts |
| `animate-float` | 3s | Floating elements |
| `animate-shimmer-text` | 2s | Skeleton text |
| `animate-color-shift` | 3s | Dynamic text |

---

Ready to use! Start implementing these animations to enhance your FleetFlow UI! 🎉
