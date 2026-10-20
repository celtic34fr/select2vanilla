# ChangeLog — celtic34fr/select2vanilla

## [0.1.0] — 2026-10-20

Première version fonctionnelle de la librairie Select2Vanilla.

### 🐛 Corrections de bugs (`src/select2vanilla.js`)

- **Export de la classe** : `window.Select2Vanilla` exporte désormais la classe `Select2Vanilla` et non plus une instance inutilisable. Il est possible de faire `new Select2Vanilla(...)` depuis l'extérieur. Export ES module ajouté (`export default Select2Vanilla`).
- **`this.selected` auto-créé** : si aucun élément `.selected` n'existe dans le DOM, le code en crée un automatiquement après le `<select>`. Cela évite l'erreur `TypeError` sur `this.selected.querySelector(...)`.
- **Sécurité du parentNode** : vérification de `this.select.parentNode` avant accès pour éviter le crash si le `<select>` n'est pas encore dans le DOM.
- **`removeSelectedValue` corrigé** : utilisation de `option.dataset.value` au lieu de `option.value`. La suppression est maintenant ciblée sur l'option concernée uniquement (plus de recréation complète du `<select>` via `innerHTML = ''`).
- **`option.label` remplacé** : dans la reconstruction du `<select>`, `option.textContent` est utilisé au lieu de l'inexistant `option.label`.
- **Sécurité du bouton de suppression** : `removeBtn.innerHTML = ...` remplacé par `removeBtn.textContent = ...` (pas d'injection HTML via l'option `removeIconHtml`).
- **`stopPropagation` sur la croix** : le clic sur le bouton de suppression ne déclenche plus l'ouverture/fermeture intempestive du dropdown.
- **Méthode `destroy()` ajoutée** : retire l'écouteur global `document.click`, vide les événements personnalisés, supprime le conteneur custom du DOM et restaure l'affichage du `<select>` d'origine. Évite les fuites mémoire.
- **Gestion d'id manquant** : les inputs hidden générés utilisent un id de fallback (`s2v-hidden`) si l'élément `.selected` n'en possède pas.
- **`triggerEvent` sécurisé** : vérifie que l'événement existe avant d'itérer sur ses callbacks.
- **`initialize` robuste** : ne plante plus si `selectElement` est `null` ou `undefined`.

### ✨ Nouvelle fonctionnalité

- **Option `removeIconHtml`** : ajout d'une option de configuration permettant de personnaliser le HTML du bouton de suppression. Valeur par défaut : `'×'`. Exemple : `'<i class="fa fa-times" aria-hidden="true"></i>'`.

### 🎨 CSS (`src/select2vanilla.css`)

- **Positionnement de la croix** : `.s2v__remove` est désormais en `position: absolute; top: 2px; right: 4px`, soit en haut-droite de chaque pill de sélection (`.s2v__selected`).
- **Effet de survol** : `.s2v__remove:hover` passe en rouge (`#c00`).

### 🧪 Tests (`test/select2vanilla.test.js`)

- **Environnement de test** : ajout de `package.json` avec `vitest` et `jsdom`, fichier `vitest.config.js`, et script `npm test`.
- **17 tests unitaires** couvrant : export de la classe, méthodes du prototype, initialisation, gestion du `null`, sélection multiple/simple, pas de doublons, suppression, `getValues`, `setValues`, `reset`, `filterOptions`, `toggleDropdown`, `destroy`, option `removeIconHtml`, événements `change`.
- Tous les tests passent (17/17).

### 📦 Installation

- **Ajout de `composer.json`** : le package `celtic34fr/select2vanilla` est désormais déclarable via Composer (type `library`). Installation possible avec un repository VCS dans le `composer.json` du projet client.
- **Aucune installation via NPM** n'est prévue pour le moment.

### 📚 Documentation

- **`README.md`** : point d'entrée bilingue (français / anglais) avec installation rapide et liens vers les documentations détaillées.
- **`README.fr.md`** : documentation complète en français (installation Composer et téléchargement direct, utilisation, options, méthodes, événements, exemple Font Awesome, intégration Symfony).
- **`README.en.md`** : documentation complète en anglais (même contenu).

### 🗺️ Feuille de route (TODO)

- **`TODO.md`** (français) et **`TODO.en.md`** (anglais) : liste des fonctionnalités manquantes avant la version 1.0.0 (accessibilité, validation `required`, état `disabled`, groupes `<optgroup>`, mise à jour dynamique, tests complets, etc.).
