# Select2Vanilla — Documentation (English)

Vanilla JavaScript adaptation of the jQuery Select2 library.
The goal is to provide the same features as Select2 without jQuery dependency.

---

## Installation

Two methods are available: via **Composer** or by **direct download**.
No NPM installation is planned at the moment.

### Method 1 — Via Composer

Declare the Git repository in your `composer.json`, then install the package:

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/celtic34fr/select2vanilla.git"
        }
    ],
    "require": {
        "celtic34fr/select2vanilla": "*"
    }
}
```

Then:

```bash
composer require celtic34fr/select2vanilla
```

The JavaScript and CSS files will be installed in:

```
vendor/celtic34fr/select2vanilla/src/select2vanilla.js
vendor/celtic34fr/select2vanilla/src/select2vanilla.css
```

You will then need to copy or expose them in your public directory (for example via `assets:install` under Symfony, or by copying them manually into `public/`).

### Method 2 — Direct download

Get the files from the `src/` folder:

- `src/select2vanilla.js`
- `src/select2vanilla.css`

Then include them in your page:

```html
<link rel="stylesheet" href="path/to/select2vanilla.css" />
<select id="my-select">
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
</select>
<script src="path/to/select2vanilla.js"></script>
<script>
    new Select2Vanilla("#my-select", {
        placeholder: "Select an option",
        multiple: true
    });
</script>
```

### Via CDN

If the project is published on a CDN, use the corresponding URL (adapt to your hosting).

---

## Basic usage

```javascript
const instance = new Select2Vanilla(selectElement, options);
```

- `selectElement`: CSS selector (`"#id"`), DOM element, or `null`.
- `options`: configuration object (see below).

Minimal example:

```html
<select id="countries">
    <option value="fr">France</option>
    <option value="be">Belgium</option>
    <option value="ch">Switzerland</option>
</select>

<script src="select2vanilla.js"></script>
<script>
    new Select2Vanilla("#countries", {
        placeholder: "Choose a country",
        multiple: false
    });
</script>
```

---

## Configuration options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placeholder` | `string` | `'Choisir ou saisir'` | Placeholder text in the search input |
| `choices` | `Array` | `[]` | Static choices (`[{value, label}, ...]`) |
| `data` | `Array` | `[]` | Preselected data on load (`[{value, label}, ...]`) |
| `multiple` | `boolean` | `false` | Allow multiple selection |
| `allow_add` | `boolean` | `false` | Allow adding free values on input |
| `removeIconHtml` | `string` | `'×'` | HTML inserted in the remove button (e.g. `'<i class="fa fa-times"></i>'`) |

Complete example:

```javascript
new Select2Vanilla("#my-select", {
    placeholder: "Select...",
    multiple: true,
    allow_add: true,
    removeIconHtml: '<i class="fa fa-times" aria-hidden="true"></i>'
});
```

---

## Public methods

| Method | Description |
|--------|-------------|
| `getValues()` | Returns an array of currently selected values |
| `setValues(valuesArray)` | Programmatically selects an array of `{value, label}` |
| `reset()` | Resets all selections |
| `destroy()` | Removes the instance from the DOM and detaches event listeners |
| `addSelectedValue(value, label)` | Manually adds a selection |
| `removeSelectedValue(value, spanElement)` | Removes a selection |
| `filterOptions(searchValue)` | Filters displayed options by string |
| `toggleDropdown(forceOpen)` | Opens or closes the dropdown list |
| `setOption(name, value)` | Changes an option after initialization |
| `getOption(name)` | Gets the value of an option |
| `triggerEvent(name, data)` | Triggers a custom event (`change`, `filter`) |

---

## Events

Subscribe to events via `instance.events.name.push(callback)`:

```javascript
const s2 = new Select2Vanilla("#select", { multiple: true });

s2.events.change.push(function (data) {
    console.log("Change:", data);
    // data = { value, label, removed? }
});

s2.events.filter.push(function (data) {
    console.log("Filter:", data.query);
});
```

---

## Example: multiple selection with Font Awesome icon

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
<link rel="stylesheet" href="select2vanilla.css" />

<select id="tags" multiple>
    <option value="php">PHP</option>
    <option value="symfony">Symfony</option>
    <option value="js">JavaScript</option>
</select>

<script src="select2vanilla.js"></script>
<script>
    new Select2Vanilla("#tags", {
        multiple: true,
        placeholder: "Choose tags",
        removeIconHtml: '<i class="fa-solid fa-times" aria-hidden="true"></i>'
    });
</script>
```

---

## Integration with Symfony (Select2VanillaBundle)

This JavaScript code is designed to be used with the Symfony bundle [`Select2VanillaBundle`](https://github.com/select2-vanilla/bundle). The bundle provides:

- a `FormType` (`Select2Type`) extending `ChoiceType` (array or Doctrine entity),
- a Twig theme (`select2_widget`) generating the `data-*` attributes,
- automatic initialization via `select2-vanilla-init.js`.

The bundle passes the `removeIconHtml` option from Symfony configuration or field option.

---

## License

MIT
