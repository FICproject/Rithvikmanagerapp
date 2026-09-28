# 19. Mobile UI/UX Design System Guidelines

## 1. Design Tokens & Branding Palette

The design reflects an enterprise SaaS mobile design system tailored for Android field usability.

### Semantic Colors

- **Primary**: `#0B4A8B` (FIC Deep Navy Blue)
- **Primary Dark**: `#07325F`
- **Accent**: `#F2A900` (FIC Gold Yellow)
- **Background**: `#F8FAFC` (Light neutral slate background)
- **Surface**: `#FFFFFF` (Card & Modal surface)
- **Text**: `#0F172A` (Slate 900)
- **Secondary Text**: `#475569` (Slate 600)
- **Muted Text**: `#94A3B8` (Slate 400)
- **Border**: `#E2E8F0`
- **Success**: `#10B981` (Emerald 500)
- **Warning**: `#F59E0B` (Amber 500)
- **Error**: `#EF4444` (Red 500)

---

## 2. Component Primitives Catalog

The core UI component library under `src/components/ui/` consists of:

1. **`FICButton`**: Supports variants (`primary`, `secondary`, `outline`, `destructive`, `text`) and states (`default`, `pressed`, `disabled`, `loading`).
2. **`FICIconButton`**: Touch-target compliant icon button container (min 48dp).
3. **`FICTextInput`**: Input container supporting `label`, `placeholder`, `error`, `helperText`, `disabled`, `focused`, and `secureTextEntry`.
4. **`FICCard`**: Enterprise card surface with restrained elevation (`elevation: 2`, `shadowColor: #0F172A`).
5. **`FICBadge`**: Compact status indicator container.
6. **`FICPriorityBadge`**: Accessible priority indicator (`LOW`, `MEDIUM`, `HIGH`) combining color, label, and symbolic indicator (`▼`, `■`, `▲`).
7. **`FICStatusBadge`**: Semantic badge for vendor, task, and issue statuses.
8. **`FICAvatar`**: Circle avatar with image or initial fallback (`FIC`).
9. **`FICHeader`**: Standard app header bar with title and action buttons.
10. **`FICSectionHeader`**: Section grouping header with optional right action.
11. **`FICListItem`**: Standard list item row with icon, title, and subtitle.
12. **`FICDivider`**: Standard horizontal line divider.

---

## 3. Feedback Primitives Catalog

The feedback component library under `src/components/feedback/` consists of:

1. **`FICLoadingState`**: Centered activity spinner with custom loading message.
2. **`FICEmptyState`**: Empty container with title, description, icon, and retry/action button.
3. **`FICErrorState`**: Service error container with title, error narrative, and retry button.

---

## 4. Android Usability & Accessibility Principles

- **Touch Target Threshold**: Every clickable element (`FICButton`, `FICIconButton`, `FICListItem`, `FICTextInput`) enforces a minimum touch target size of **48dp**.
- **Restrained Visual Decoration**: Banned gradient overflows, heavy glassmorphism blurs, giant empty white spaces, and desktop UI direct copy-pastes.
