# Screenshot Instructions for User Guide

## Overview

Create 4 screenshots to illustrate the Focus and Export features in the Family Tree Editor help documentation.

**Save location:** `/Users/jimbrannigan/Documents/GitHub/family-tree-editor/public/help-images/`

---

## GIMP Aspect Ratio Settings

### For Wide Screenshots (Screenshots 2 & 4):

**Aspect Ratio: 16:9**

- In GIMP: Use the Rectangle Select tool (R)
- In the Tool Options, check "Fixed" and select "Aspect ratio"
- Enter: **16:9** or **1.778:1**
- **Recommended pixel dimensions:** 1280 x 720 or 1600 x 900

### For Tight Crops (Screenshots 1 & 3):

**Aspect Ratio: 4:3**

- In GIMP: Rectangle Select tool (R)
- Tool Options: "Fixed" → "Aspect ratio"
- Enter: **4:3** or **1.333:1**
- **Recommended pixel dimensions:** 800 x 600 or 1024 x 768

---

## Screenshot 1: Focus Button Location

**Filename:** `focus-button.png`
**Aspect Ratio:** 4:3 (800 x 600)
**Save to:** `/Users/jimbrannigan/Documents/GitHub/family-tree-editor/public/help-images/focus-button.png`

### Steps:

1. Open the app at http://localhost:3000
2. Add some sample tree data in the Edit tab (or use your existing tree)
3. Click the **List** tab
4. Make sure the tree is expanded so you can see several people
5. Take screenshot of this region:
   - Include 2-3 people from the tree list
   - Make sure the **🔍 button** next to each person's name is clearly visible
   - Crop to show just the tree items with the focus buttons
   - Optional: Highlight/circle the 🔍 button on one person
6. **What to emphasize:** The 🔍 magnifying glass icon button next to a person's name
7. **Crop:** Just the relevant tree items, using 4:3 aspect ratio

---

## Screenshot 2: Focused View Active

**Filename:** `focused-view.png`
**Aspect Ratio:** 16:9 (1280 x 720)
**Save to:** `/Users/jimbrannigan/Documents/GitHub/family-tree-editor/public/help-images/focused-view.png`

### Steps:

1. In the **List** tab with tree data loaded
2. **Click the 🔍 button** on someone who has children (middle of tree, not a leaf)
3. The view now shows only that person and their descendants
4. Take screenshot of this region:
   - Include the entire List tab pane
   - Make sure the **"Unfocus"** button at the top is visible
   - Show the reduced tree (focused person + descendants)
   - Include the toolbar with "Expand All", "Collapse All", and "Unfocus" buttons
5. **What to emphasize:** The "Unfocus" button and the reduced tree view
6. **Crop:** The entire content area of the List tab, using 16:9 aspect ratio

---

## Screenshot 3: Export Panel

**Filename:** `export-panel.png`
**Aspect Ratio:** 4:3 (800 x 600)
**Save to:** `/Users/jimbrannigan/Documents/GitHub/family-tree-editor/public/help-images/export-panel.png`

### Steps:

1. From any tab (Edit, List, or Diagram)
2. Look at the top toolbar on the **right side**
3. Take screenshot of this region:
   - The export panel box with:
     - "Format:" label and checkboxes (HTML, JSON, TXT, SVG)
     - "Scope:" label and radio buttons (Full tree, Focused subtree)
     - The blue "Export" button
   - Just this panel, tightly cropped
4. **What to emphasize:** The entire export panel (it has a border and background)
5. **Crop:** Just the export panel box, using 4:3 aspect ratio
6. **Optional:** Draw a box/arrow around the whole panel to show it's one unit

---

## Screenshot 4: Pedigree View (Optional but Helpful)

**Filename:** `pedigree-view.png`
**Aspect Ratio:** 16:9 (1280 x 720)
**Save to:** `/Users/jimbrannigan/Documents/GitHub/family-tree-editor/public/help-images/pedigree-view.png`

### Steps:

1. Go to **List** tab
2. **Click 🔍 on someone** who has parents/grandparents (someone deep in the tree)
3. Switch to the **Diagram** tab
4. **Check the "Show pedigree" checkbox** at the top of the Diagram pane
5. The diagram should now show only ancestors (upward tree)
6. Take screenshot of this region:
   - The Diagram tab showing the pedigree chart
   - Include the "Show pedigree" checkbox at the top (checked)
   - Show the resulting ancestor-only diagram
7. **What to emphasize:** The pedigree checkbox (checked) and the resulting ancestor tree
8. **Crop:** The entire Diagram tab content area, using 16:9 aspect ratio

---

## Quick GIMP Workflow

1. Take screenshot (full screen or window using your system's screenshot tool)
2. Open screenshot in GIMP
3. Select **Rectangle Select Tool** (press R key)
4. In **Tool Options** panel (usually on left side):
   - Check the **"Fixed"** checkbox
   - Select **"Aspect ratio"** from the dropdown menu
   - Enter **16:9** or **4:3** (depending on which screenshot you're working on)
5. Draw selection box around the area you want to capture
6. **Image → Crop to Selection** (from menu bar)
7. **Image → Scale Image** (if needed to hit exact recommended dimensions)
8. **File → Export As...**
   - Choose PNG format
   - Use the filename from instructions above
   - Save to `/Users/jimbrannigan/Documents/GitHub/family-tree-editor/public/help-images/`

---

## Summary Table

| #   | Filename            | Aspect Ratio | Dimensions | What to Show                                                   |
| --- | ------------------- | ------------ | ---------- | -------------------------------------------------------------- |
| 1   | `focus-button.png`  | 4:3          | 800 x 600  | 🔍 button next to person names in List view                    |
| 2   | `focused-view.png`  | 16:9         | 1280 x 720 | "Unfocus" button + reduced tree after focusing                 |
| 3   | `export-panel.png`  | 4:3          | 800 x 600  | Export panel: Format checkboxes + Scope radios + Export button |
| 4   | `pedigree-view.png` | 16:9         | 1280 x 720 | Diagram tab with "Show pedigree" checked + ancestor chart      |

---

## File Requirements

- **Format:** PNG (preferred for UI screenshots)
- **Size:** Keep under 500KB each if possible
- **Quality:** Clear, readable text
- **Optional:** Add arrows, circles, or highlights to emphasize key UI elements

---

## After Creating Screenshots

1. Create the folder if it doesn't exist: `mkdir -p public/help-images`
2. Save all 4 PNG files to that folder
3. Notify Claude Code that screenshots are ready
4. Images will be integrated into the UserGuide component with proper styling and alt text
