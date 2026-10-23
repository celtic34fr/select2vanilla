# TODO — Towards version 1.0.0

This file lists in detail all the features, fixes, and improvements to implement before considering the `select2vanilla` library stable and ready for version 1.0.0.

It is intended for contributors, maintainers, and users who want to understand what is missing and how to participate.

---

## 1. Accessibility (a11y)

### 1.1 ARIA roles on the custom container

**Problem:** The generated `<div class="s2v__customSelect">` has no ARIA role. A screen reader does not know it is a selection component.

**Why it matters:** Without a role, assistive technology users cannot interact with the component.

**Implementation tracks:**
- Add `role="combobox"` on `.s2v__customSelect`
- Add `aria-expanded="false"` (switch to `true` when the dropdown is open)
- Add `aria-haspopup="listbox"`
- Associate the search input (`.s2v__search`) with `aria-controls` pointing to the dropdown
- Add `role="listbox"` on `.s2v__dropdown` and `role="option"` on each `.s2v__options li`

**Acceptance criteria:**
- A screen reader correctly announces the component role
- The open/closed state of the dropdown is announced

---

### 1.2 Keyboard focus inside the dropdown

**Problem:** Once the dropdown is open, the user cannot navigate between options with keyboard arrows, validate with Enter, or close with Escape.

**Why it matters:** Keyboard navigation is mandatory for accessibility and for power users.

**Implementation tracks:**
- Listen to `keydown` events on the search input
- `ArrowDown`: move focus to the next option (scroll if necessary)
- `ArrowUp`: move focus to the previous option
- `Enter`: select the option currently focused
- `Escape`: close the dropdown and return focus to the input
- `Tab`: manage focus cycle between selected pills, the input, and remove buttons

**Acceptance criteria:**
- You can open, navigate, select, and close the dropdown using only the keyboard
- Visible focus is indicated on the keyboard-hovered option

---

### 1.3 Label / field association

**Problem:** The `<label>` element associated with the original `<select>` is not linked to the generated custom component.

**Why it matters:** Clicking the label should activate the custom search input.

**Implementation tracks:**
- Retrieve the `<label>` linked to the `<select>` (via `for` attribute or nesting)
- Add a click listener on this label that focuses the `.s2v__search` input

---

### 1.4 Announce changes to screen readers

**Problem:** When a selection is added or removed, no event is announced.

**Why it matters:** Visually impaired users need to know when a value is added or removed.

**Implementation tracks:**
- Add a visually hidden region with `aria-live="polite"` (or `assertive`)
- Update its content with messages like "1 item selected" or "Option X removed"

---

## 2. HTML5 Validation

### 2.1 `required` attribute

**Problem:** If the original `<select>` has the `required` attribute, the custom component does not enforce it. The form can be submitted without a selection.

**Why it matters:** Browser-side validation should work transparently.

**Implementation tracks:**
- Detect the presence of `required` on the original `<select>`
- On form submission, if no value is selected and `required` is present, block submission and display the browser's native validation message
- Apply a visual error style on `.s2v__customSelect` (red border, for example)

**Acceptance criteria:**
- The form refuses submission if the field is required and empty
- The browser's native validation message appears

---

## 3. `disabled` state

### 3.1 Respect the `disabled` attribute

**Problem:** If the original `<select>` is disabled (`disabled`), the custom select remains interactive.

**Why it matters:** The disabled state must be respected for consistency with the rest of the form.

**Implementation tracks:**
- Detect the `disabled` attribute on the `<select>` at initialization
- Add the `disabled` attribute on the `.s2v__search` input
- Prevent the dropdown from opening (disable click and input events)
- Apply a disabled visual style (reduced opacity, not-allowed cursor)
- Disable remove buttons (`.s2v__remove`) on existing pills

**Acceptance criteria:**
- A disabled select generates a visually and functionally disabled custom select

---

## 4. Option groups (`<optgroup>`)

### 4.1 Support optgroups

**Problem:** The JS only reads direct `<option>` children. `<optgroup>` elements and their labels are ignored.

**Why it matters:** Many forms use groups to organize choices.

**Implementation tracks:**
- In `buildCustomSelect()`, detect `<optgroup>` children of the `<select>`
- For each optgroup, create a separator element in the list (ex: `<li role="separator">` or a `<span>` with a specific class)
- Apply a distinct style (bold, slightly different background, not clickable)
- Keep the value/label association for nested options

**Acceptance criteria:**
- Optgroups appear as non-selectable separators in the dropdown
- Options inside remain selectable normally

---

## 5. Dynamic choice updates

### 5.1 Add choices after initialization

**Problem:** Once the instance is created, there is no way to add new choices to the list.

**Why it matters:** Some forms need to enrich the list based on other selections (dependent fields).

**Implementation tracks:**
- Method `addChoice(value, label)` that creates a new `<li>` in `.s2v__options`, a new `<option>` in the hidden `<select>`, and updates `this.options`
- Optional: reload the entire list via `setChoices([...])` that empties and rebuilds

---

### 5.2 Remove choices after initialization

**Problem:** Impossible to remove a choice from the available list after creation.

**Implementation tracks:**
- Method `removeChoice(value)` that removes the corresponding `<li>`, the `<option>` from the hidden `<select>`, and cleans `this.options`

---

### 5.3 Reload data

**Problem:** No method to replace the entire choice list with a new source.

**Implementation tracks:**
- Method `setData(valuesArray)` that calls `reset()` then replays `setValues()` with the new data

---

## 6. Tests

### 6.1 Unit tests (implemented and passed)

**Current state:** The file `test/select2vanilla.test.js` contains 17 unit tests covering:
- Class export and prototype methods
- Initialization on a real `<select>` and `null`/`undefined` handling
- Multiple and single selection, no duplicates
- `addSelectedValue`, `removeSelectedValue`, `getValues`, `setValues`
- `reset`, `filterOptions`, `toggleDropdown`, `destroy`
- Custom `removeIconHtml` option
- `change` events (add and remove)

**Status:** 21 tests passed with Vitest + jsdom.

### 6.2 DOM integration tests

**To do:**
- Test initialization on a real `<select>` with multiple `<option>` (partially covered)
- Simulate a click on an option and verify the pill appears (covered)
- Simulate a click on the remove cross and verify the pill disappears and the option is no longer selected (covered)
- Simulate typing in the input and verify non-matching options are hidden (covered)
- Test multiple mode: select multiple values, display multiple pills (covered)
- Test dropdown closure by clicking outside

### 6.3 Test environment (configured)

**Current state:**
- `package.json` created with `vitest` and `jsdom` as dev dependencies
- `npm test` script configured (`vitest run`)
- `vitest.config.js` with `jsdom` environment and `globals: true`
- ES module export added in `src/select2vanilla.js` (`export default Select2Vanilla`)

---

## 7. Rendering and CSS

### 7.1 Support the `width` option

**Problem:** The `width` option (passed in the HTML test example) is ignored by the JS.

**Implementation tracks:**
- Read `this.config.width` in `buildCustomSelect()`
- Apply `this.container.style.width = this.config.width` if the value is defined

---

### 7.2 Dropdown position recalculation

**Problem:** The dropdown is `position: absolute` with `top: 100%`. If it exceeds the viewport, it is cut off.

**Implementation tracks:**
- Calculate the container position relative to the viewport (`getBoundingClientRect()`)
- If the dropdown exceeds the bottom, display it above the container (drop-up)
- If the dropdown exceeds the sides, adjust `left`/`right`

---

### 7.3 Additional visual styles

**To do:**
- Focus state on the `.s2v__search` input (visible focus ring)
- Hover state on dropdown options (already present, to harmonize)
- Selected state on an option in the dropdown (visual indicator)
- Dropdown open/close animation (optional, CSS transition)

---

## 8. Documentation

### 8.1 Integration examples with CSS frameworks

**To do:**
- Example with Bootstrap 5
- Example with Tailwind CSS
- Example with pure CSS (already covered by the README)

---

### 8.2 Custom events documentation

**To do:**
- Explain how to subscribe to `instance.events.change`
- Explain how to subscribe to `instance.events.filter`
- Provide concrete examples (ex: make an AJAX request on input, update another field)

---

### 8.3 Public API documentation

**To do:**
- Complete list of methods with signatures and examples
- Complete list of options with default values
- Example usage with Symfony `Select2VanillaBundle`

---

## Suggested priorities for version 1.0.0

| Priority | Domain | Tasks |
|----------|--------|-------|
| **Critical** | Accessibility | Basic ARIA roles, keyboard focus (arrows/Enter/Escape) |
| **Critical** | Validation | Support for `required` attribute |
| **High** | Disabled state | Respect `disabled` on the original select |
| **High** | Groups | Support `<optgroup>` |
| **Medium** | Tests | Complete unit tests + DOM integration tests |
| **Medium** | CSS | `width` option, dropdown repositioning |
| **Low** | Documentation | CSS framework examples, events documentation |

---

## How to contribute

1. Pick a task from the list above
2. Create a dedicated branch from `main`
3. Implement the feature with its tests
4. Update this `TODO.md` file by checking off the task
5. Open a Pull Request towards `main`
