# Cascading Toolbar Enhancements

## Current State
- Floating text toolbar background/border now echo the selected element’s styling (@public/app.js#1886-1974).
- Toolbar controls (font family, line spacing etc.) still use default white surfaces without matching the element’s background.
- Added sanitation helpers for color handling for reuse.

## Next Steps
1. Update individual control wrappers (FontDropdown, number inputs, ColorIconPicker) to inherit toolbarTextColor and transparent background for cohesiveness.
2. Consider color contrast issues when user picks extremely light backgrounds; maybe add minimum contrast overlay.
3. Extend the same logic to shape/chart toolbars for consistency.
4. Provide unit-style utility for mixing colors to avoid duplication once more toolbars adopt similar behavior.
