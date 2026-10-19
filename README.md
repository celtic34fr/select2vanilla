# Select2Vanilla

Adaptation de la librairie jQuery Select2 en JavaScript (Vanilla) / Vanilla JavaScript adaptation of the jQuery Select2 library.

Le but est de pouvoir avoir les mêmes fonctionnalités que la librairie Select2 sans devoir utiliser jQuery. / The goal is to provide the same features as Select2 without jQuery dependency.

---

## Documentation

- [Documentation en français](./README.fr.md)
- [Documentation in English](./README.en.md)

## Installation rapide / Quick start

```html
<link rel="stylesheet" href="src/select2vanilla.css" />
<select id="mon-select">
    <option value="fr">France</option>
    <option value="be">Belgique</option>
</select>
<script src="src/select2vanilla.js"></script>
<script>
    new Select2Vanilla("#mon-select", {
        placeholder: "Sélectionner / Choose",
        multiple: true
    });
</script>
```

## Licence / License

MIT
