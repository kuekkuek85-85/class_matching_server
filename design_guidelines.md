# Design Guidelines: 학생 프로그램 신청 및 배치 시스템

## Design Approach
**Selected Approach:** Design System-based (Administrative Dashboard)
**Primary References:** Linear (clean forms), Notion (data tables), Vercel Dashboard (minimalist admin)
**Rationale:** Utility-focused administrative tool requiring efficient data entry, clear information hierarchy, and reliable performance for teachers and students.

---

## Typography

**Font Family:**
- Primary: `Inter` (Google Fonts) - for all UI text
- Monospace: `JetBrains Mono` - for student IDs and data tables

**Type Scale:**
- Page Titles: `text-3xl font-bold` (30px)
- Section Headers: `text-xl font-semibold` (20px)
- Card/Component Titles: `text-lg font-medium` (18px)
- Body Text: `text-base` (16px)
- Labels/Captions: `text-sm` (14px)
- Helper Text: `text-xs` (12px)

---

## Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: `p-6` or `p-8`
- Section margins: `mb-8` or `mb-12`
- Form field spacing: `space-y-4`
- Card gaps: `gap-6`

**Container Strategy:**
- Student Pages (`/`): Centered container `max-w-2xl mx-auto px-4`
- Admin Pages (`/admin`): Full-width with sidebar `max-w-7xl mx-auto px-6`

---

## Component Library

### Navigation
**Student Pages:** Simple header with logo/title only
**Admin Pages:** Persistent sidebar navigation
- Width: `w-64`
- Navigation items with icons (Heroicons)
- Active state: bold font weight + subtle indicator

### Forms
**Input Fields:**
- Height: `h-12`
- Padding: `px-4`
- Border: `border-2` with rounded corners `rounded-lg`
- Focus: prominent ring effect `focus:ring-2`

**Select Dropdowns:**
- Same styling as inputs
- Clear visual hierarchy for choices (1지망 most prominent)

**Buttons:**
- Primary: Large, bold `px-8 py-3 text-lg font-semibold rounded-lg`
- Secondary: Outlined style `border-2`
- Icon buttons for actions: `h-10 w-10 rounded-lg`

### Data Display
**Tables:**
- Striped rows for readability
- Fixed column widths for student IDs
- Sortable headers with visual indicators
- Sticky header on scroll

**Statistics Cards:**
- Grid layout: `grid-cols-1 md:grid-cols-3 gap-6`
- Large numbers with descriptive labels
- Icon + metric + label structure

**Program Cards:**
- Border style with hover elevation
- Quota display with progress indicator
- Action buttons positioned consistently

### Status Indicators
- Submission count badge
- Allocation status (배치완료/미배치)
- Program capacity (정원 충족/여유)

---

## Page Structures

### Student Application (`/`)
1. **Hero Section:** Welcome title + brief instructions (`py-12`)
2. **Application Form Card:** Centered, elevated card design
   - Student ID + Name (top)
   - Choice selections (1지망 → 2지망 → 3지망)
   - Conditional fields (전화번호/생년월일) appear smoothly
   - Submit button (full-width at bottom)

### Admin Dashboard (`/admin`)
**Layout:** Sidebar + Main Content Area
- Sidebar: Fixed left, program management links
- Main: Statistics overview with cards
- Quick actions positioned prominently

### Program Management (`/admin/programs`)
- Add program form (inline or modal)
- Programs list: Card grid or table format
- Delete actions with clear confirmation

### Allocation View (`/admin/allocation`)
1. **Control Panel:** Run allocation button + export CSV
2. **Statistics Section:** Grid of allocation metrics
3. **Results Table:** Searchable, filterable student allocation list
4. **Visualization:** Simple bar charts for program fill rates

---

## Interactions

**Form Validation:**
- Inline error messages below fields
- Error state: red border `border-red-500`
- Success state: green checkmark icon

**Loading States:**
- Spinner for allocation processing
- Skeleton screens for data loading
- Disabled state for buttons during submission

**Feedback:**
- Toast notifications (top-right) for success/error
- Confirmation modals for destructive actions (삭제)

---

## Images

**Not Required** - This is a purely functional administrative tool. No hero images or decorative photography needed. Focus on clean data presentation and efficient workflows.

---

## Key Principles

1. **Clarity First:** Every element serves a functional purpose
2. **Form-Focused:** Optimize for fast, error-free data entry
3. **Data Legibility:** Tables and statistics are easily scannable
4. **Responsive:** Mobile-friendly forms for student submissions
5. **Minimal Distraction:** No animations except loading indicators