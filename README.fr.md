# Select2Vanilla — Documentation (Français)

Adaptation de la librairie jQuery Select2 en JavaScript pur (Vanilla).
Le but est d'avoir les mêmes fonctionnalités que Select2 sans dépendance à jQuery.

---

## Installation

Deux méthodes sont proposées : via **Composer** ou par **téléchargement direct**.
Aucune installation via NPM n'est prévue pour le moment.

### Méthode 1 — Via Composer

Déclarez le repository Git dans votre `composer.json`, puis installez le package :

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

Puis :

```bash
composer require celtic34fr/select2vanilla
```

Les fichiers JavaScript et CSS seront installés dans :

```
vendor/celtic34fr/select2vanilla/src/select2vanilla.js
vendor/celtic34fr/select2vanilla/src/select2vanilla.css
```

Il vous appartiendra ensuite de les copier ou de les exposer dans votre répertoire public (par exemple via `assets:install` sous Symfony, ou en les recopiant manuellement dans `public/`).

### Méthode 2 — Téléchargement direct

Récupérez les fichiers dans le dossier `src/` :

- `src/select2vanilla.js`
- `src/select2vanilla.css`

Puis incluez-les dans votre page :

```html
<link rel="stylesheet" href="chemin/vers/select2vanilla.css" />
<select id="mon-select">
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
</select>
<script src="chemin/vers/select2vanilla.js"></script>
<script>
    new Select2Vanilla("#mon-select", {
        placeholder: "Sélectionner une option",
        multiple: true
    });
</script>
```

### Via CDN

Si le projet est publié sur un CDN, utilisez l'URL correspondante (à adapter selon votre hébergement).

---

## Utilisation basique

```javascript
const instance = new Select2Vanilla(selectElement, options);
```

- `selectElement` : sélecteur CSS (`"#id"`), élément DOM ou `null`.
- `options` : objet de configuration (voir ci-dessous).

Exemple minimal :

```html
<select id="pays">
    <option value="fr">France</option>
    <option value="be">Belgique</option>
    <option value="ch">Suisse</option>
</select>

<script src="select2vanilla.js"></script>
<script>
    new Select2Vanilla("#pays", {
        placeholder: "Choisir un pays",
        multiple: false
    });
</script>
```

---

## Options de configuration

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `placeholder` | `string` | `'Choisir ou saisir'` | Texte affiché dans le champ de saisie |
| `choices` | `Array` | `[]` | Liste de choix statiques (`[{value, label}, ...]`) |
| `data` | `Array` | `[]` | Données présélectionnées au chargement (`[{value, label}, ...]`) |
| `multiple` | `boolean` | `false` | Autorise la sélection multiple |
| `allow_add` | `boolean` | `false` | Autorise l'ajout de valeurs libres à la saisie |
| `removeIconHtml` | `string` | `'×'` | HTML inséré dans le bouton de suppression (ex: `'<i class="fa fa-times"></i>'`) |

Exemple complet :

```javascript
new Select2Vanilla("#mon-select", {
    placeholder: "Sélectionner...",
    multiple: true,
    allow_add: true,
    removeIconHtml: '<i class="fa fa-times" aria-hidden="true"></i>'
});
```

---

## Méthodes publiques

| Méthode | Description |
|---------|-------------|
| `getValues()` | Retourne un tableau des valeurs actuellement sélectionnées |
| `setValues(valuesArray)` | Sélectionne programmatiquement un tableau de valeurs `{value, label}` |
| `reset()` | Réinitialise toutes les sélections |
| `destroy()` | Supprime l'instance du DOM et retire les écouteurs d'événements |
| `addSelectedValue(value, label)` | Ajoute une sélection manuellement |
| `removeSelectedValue(value, spanElement)` | Supprime une sélection |
| `filterOptions(searchValue)` | Filtre les options affichées selon une chaîne |
| `toggleDropdown(forceOpen)` | Ouvre ou ferme la liste déroulante |
| `setOption(name, value)` | Modifie une option après initialisation |
| `getOption(name)` | Récupère la valeur d'une option |
| `triggerEvent(name, data)` | Déclenche un événement personnalisé (`change`, `filter`) |

---

## Événements

Vous pouvez souscrire aux événements via `instance.events.nom.push(callback)` :

```javascript
const s2 = new Select2Vanilla("#select", { multiple: true });

s2.events.change.push(function (data) {
    console.log("Changement :", data);
    // data = { value, label, removed? }
});

s2.events.filter.push(function (data) {
    console.log("Recherche :", data.query);
});
```

---

## Exemple : sélection multiple avec icône Font Awesome

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
        placeholder: "Choisir des tags",
        removeIconHtml: '<i class="fa-solid fa-times" aria-hidden="true"></i>'
    });
</script>
```

---

## Intégration avec Symfony (Select2VanillaBundle)

Ce code JavaScript est conçu pour être utilisé avec le bundle Symfony [`Select2VanillaBundle`](https://github.com/select2-vanilla/bundle). Le bundle fournit :

- un `FormType` (`Select2Type`) qui étend `ChoiceType` (tableau ou entité Doctrine),
- un thème Twig (`select2_widget`) qui génère les attributs `data-*`,
- l'initialisation automatique via `select2-vanilla-init.js`.

Le bundle passe l'option `removeIconHtml` depuis la configuration Symfony ou l'option du champ.

---

## Licence

MIT
