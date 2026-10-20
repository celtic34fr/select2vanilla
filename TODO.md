# TODO — Vers la version 1.0.0

Ce fichier recense de manière détaillée l'ensemble des fonctionnalités, correctifs et améliorations à implémenter avant de considérer la librairie `select2vanilla` comme stable et prête pour une version 1.0.0.

Il est destiné aux contributeurs, mainteneurs et utilisateurs qui souhaitent comprendre ce qui manque et comment participer.

---

## 1. Accessibilité (a11y)

### 1.1 Rôles ARIA sur le conteneur custom

**Problème :** Le `<div class="s2v__customSelect">` généré par JavaScript ne possède aucun rôle ARIA. Un lecteur d'écran ne sait pas qu'il s'agit d'un composant de sélection.

**Pourquoi c'est important :** Sans rôle, les utilisateurs de technologies d'assistance ne peuvent pas interagir avec le composant.

**Pistes d'implémentation :**
- Ajouter `role="combobox"` sur `.s2v__customSelect`
- Ajouter `aria-expanded="false"` (passer à `true` quand le dropdown est ouvert)
- Ajouter `aria-haspopup="listbox"`
- Associer l'input de recherche (`s2v__search`) avec `aria-controls` pointant vers le dropdown
- Ajouter `role="listbox"` sur `.s2v__dropdown` et `role="option"` sur chaque `.s2v__options li`

**Critères d'acceptation :**
- Un lecteur d'écran annonce correctement le rôle du composant
- L'état ouvert/fermé du dropdown est annoncé

---

### 1.2 Focus clavier dans le dropdown

**Problème :** Une fois le dropdown ouvert, l'utilisateur ne peut pas naviguer entre les options avec les flèches du clavier, ni valider avec Entrée, ni fermer avec Échap.

**Pourquoi c'est important :** La navigation au clavier est obligatoire pour l'accessibilité et pour les utilisateurs avancés.

**Pistes d'implémentation :**
- Écouter les événements `keydown` sur l'input de recherche
- `ArrowDown` : déplacer le focus sur l'option suivante (et faire défiler si nécessaire)
- `ArrowUp` : déplacer le focus sur l'option précédente
- `Entrée` : sélectionner l'option sur laquelle le focus est posé
- `Échap` : fermer le dropdown et revenir le focus sur l'input
- `Tab` : gérer le cycle de focus entre les pills sélectionnées, l'input et le bouton de suppression

**Critères d'acceptation :**
- On peut ouvrir, naviguer, sélectionner et fermer le dropdown uniquement au clavier
- Le focus visible est indiqué sur l'option survolée au clavier

---

### 1.3 Association label / champ

**Problème :** L'élément `<label>` associé au `<select>` d'origine n'est pas relié au composant custom généré.

**Pourquoi c'est important :** Cliquer sur le label doit activer le champ de saisie du custom select.

**Pistes d'implémentation :**
- Récupérer l'élément `<label>` lié au `<select>` (via l'attribut `for` ou l'imbrication)
- Ajouter un écouteur de clic sur ce label qui met le focus sur l'input `.s2v__search`

---

### 1.4 Annonce des changements aux lecteurs d'écran

**Problème :** Lorsqu'une sélection est ajoutée ou supprimée, aucun événement n'est annoncé.

**Pourquoi c'est important :** L'utilisateur malvoyant doit savoir qu'une valeur a été ajoutée ou retirée.

**Pistes d'implémentation :**
- Ajouter une zone `aria-live="polite"` (ou `assertive`) cachée visuellement
- Mettre à jour son contenu avec un message type "1 élément sélectionné" ou "Option X retirée"

---

## 2. Validation HTML5

### 2.1 Attribut `required`

**Problème :** Si le `<select>` d'origine possède l'attribut `required`, le composant custom ne l'enforce pas. Le formulaire peut être soumis sans sélection.

**Pourquoi c'est important :** La validation côté navigateur doit fonctionner de manière transparente.

**Pistes d'implémentation :**
- Détecter la présence de `required` sur le `<select>` d'origine
- À la soumission du formulaire, si aucune valeur n'est sélectionnée et que `required` est présent, bloquer la soumission et afficher le message de validation du navigateur
- Appliquer un style visuel d'erreur sur `.s2v__customSelect` (bordure rouge, par exemple)

**Critères d'acceptation :**
- Le formulaire refuse la soumission si le champ est requis et vide
- Le message de validation native du navigateur s'affiche

---

## 3. État `disabled`

### 3.1 Respect de l'attribut `disabled`

**Problème :** Si le `<select>` d'origine est désactivé (`disabled`), le custom select reste interactif.

**Pourquoi c'est important :** L'état disabled doit être respecté pour cohérence avec le reste du formulaire.

**Pistes d'implémentation :**
- Détecter l'attribut `disabled` sur le `<select>` à l'initialisation
- Ajouter l'attribut `disabled` sur l'input `.s2v__search`
- Empêcher l'ouverture du dropdown (désactiver les événements de clic et de saisie)
- Appliquer un style visuel de désactivation (opacité réduite, curseur non-autorisé)
- Désactiver les boutons de suppression (`.s2v__remove`) sur les pills existantes

**Critères d'acceptation :**
- Un select désactivé génère un custom select désactivé visuellement et fonctionnellement

---

## 4. Groupes d'options (`<optgroup>`)

### 4.1 Support des optgroups

**Problème :** Le JS ne lit que les `<option>` directs. Les `<optgroup>` et leurs libellés sont ignorés.

**Pourquoi c'est important :** De nombreux formulaires utilisent des groupes pour organiser les choix.

**Pistes d'implémentation :**
- Dans `buildCustomSelect()`, détecter les `<optgroup>` enfants du `<select>`
- Pour chaque optgroup, créer un élément de séparation dans la liste (ex: `<li role="separator">` ou un `<span>` avec une classe spécifique)
- Appliquer un style distinct (gras, fond légèrement différent, non cliquable)
- Conserver l'association valeur/label pour les options imbriquées

**Critères d'acceptation :**
- Les optgroups s'affichent comme des séparateurs non sélectionnables dans le dropdown
- Les options à l'intérieur restent sélectionnables normalement

---

## 5. Mise à jour dynamique des choix

### 5.1 Ajout de choix après initialisation

**Problème :** Une fois l'instance créée, il n'existe aucun moyen d'ajouter de nouveaux choix à la liste.

**Pourquoi c'est important :** Certains formulaires doivent enrichir la liste selon d'autres sélections (champs dépendants).

**Pistes d'implémentation :**
- Méthode `addChoice(value, label)` qui crée un nouveau `<li>` dans `.s2v__options`, un nouvel `<option>` dans le `<select>` caché, et met à jour `this.options`
- Optionnel : recharger entièrement la liste via `setChoices([...])` qui vide et reconstruit

---

### 5.2 Suppression de choix après initialisation

**Problème :** Impossible de retirer un choix de la liste disponible après création.

**Pistes d'implémentation :**
- Méthode `removeChoice(value)` qui supprime le `<li>` correspondant, l'`<option>` du `<select>` caché, et nettoie `this.options`

---

### 5.3 Rechargement des données

**Problème :** Pas de méthode pour remplacer toute la liste de choix par une nouvelle source.

**Pistes d'implémentation :**
- Méthode `setData(valuesArray)` qui appelle `reset()` puis rejoue `setValues()` avec les nouvelles données

---

## 6. Tests

### 6.1 Tests unitaires (implémentés et passés)

**État actuel :** Le fichier `test/select2vanilla.test.js` contient 17 tests unitaires couvrant :
- Export de la classe et méthodes du prototype
- Initialisation sur un vrai `<select>` et gestion du `null`/`undefined`
- Sélection multiple et simple, pas de doublons
- `addSelectedValue`, `removeSelectedValue`, `getValues`, `setValues`
- `reset`, `filterOptions`, `toggleDropdown`, `destroy`
- Option `removeIconHtml` personnalisée
- Événements `change` (ajout et suppression)

**Statut :** 17 tests passés avec Vitest + jsdom.

### 6.2 Tests d'intégration DOM

**À faire :**
- Tester l'initialisation sur un vrai `<select>` avec plusieurs `<option>` (partiellement couvert)
- Simuler un clic sur une option et vérifier que la pill apparaît (couvré)
- Simuler un clic sur la croix de suppression et vérifier que la pill disparaît et que l'option n'est plus sélectionnée (couvré)
- Simuler une saisie dans l'input et vérifier que les options non correspondantes sont cachées (couvré)
- Tester le mode multiple : sélection de plusieurs valeurs, affichage de plusieurs pills (couvré)
- Tester la fermeture du dropdown par clic hors zone

### 6.3 Environnement de test (configuré)

**État actuel :** 
- `package.json` créé avec `vitest` et `jsdom` en dépendances de développement
- Script `npm test` configuré (`vitest run`)
- Fichier `vitest.config.js` avec environnement `jsdom` et `globals: true`
- Export ES module ajouté dans `src/select2vanilla.js` (`export default Select2Vanilla`)

---

## 7. Rendu et CSS

### 7.1 Support de l'option `width`

**Problème :** L'option `width` (passée dans l'exemple HTML de test) est ignorée par le JS.

**Pistes d'implémentation :**
- Lire `this.config.width` dans `buildCustomSelect()`
- Appliquer `this.container.style.width = this.config.width` si la valeur est définie

---

### 7.2 Recalcul du positionnement du dropdown

**Problème :** Le dropdown est en `position: absolute` avec `top: 100%`. S'il dépasse la fenêtre, il est coupé.

**Pistes d'implémentation :**
- Calculer la position du conteneur par rapport à la viewport (`getBoundingClientRect()`)
- Si le dropdown dépasse en bas, l'afficher au-dessus du conteneur (`drop-up`)
- Si le dropdown dépasse sur les côtés, ajuster `left`/`right`

---

### 7.3 Styles visuels supplémentaires

**À faire :**
- État de focus sur l'input `.s2v__search` (anneau de focus visible)
- État hover sur les options du dropdown (déjà présent, à harmoniser)
- État sélectionné sur une option dans le dropdown (indicateur visuel)
- Animation d'ouverture/fermeture du dropdown (optionnel, transición CSS)

---

## 8. Documentation

### 8.1 Exemples d'intégration avec des frameworks CSS

**À faire :**
- Exemple avec Bootstrap 5
- Exemple avec Tailwind CSS
- Exemple avec du CSS pur (déjà couvert par le README)

---

### 8.2 Documentation des événements personnalisés

**À faire :**
- Expliquer comment souscrire à `instance.events.change`
- Expliquer comment souscrire à `instance.events.filter`
- Donner des exemples concrets (ex: faire une requête AJAX à la saisie, mettre à jour un autre champ)

---

### 8.3 Documentation de l'API publique

**À faire :**
- Liste complète des méthodes avec signatures et exemples
- Liste complète des options avec valeurs par défaut
- Exemple d'utilisation avec Symfony `Select2VanillaBundle`

---

## Priorités suggérées pour la version 1.0.0

| Priorité | Domaine | Tâches |
|----------|---------|--------|
| **Critique** | Accessibilité | Rôles ARIA de base, focus clavier (flèches/Entrée/Échap) |
| **Critique** | Validation | Support de l'attribut `required` |
| **Haute** | État disabled | Respect de `disabled` sur le select d'origine |
| **Haute** | Groupes | Support des `<optgroup>` |
| **Moyenne** | Tests | Tests unitaires complets + tests d'intégration DOM |
| **Moyenne** | CSS | Option `width`, repositionnement du dropdown |
| **Basse** | Documentation | Exemples framework CSS, documentation événements |

---

## Comment contribuer

1. Choisir une tâche dans la liste ci-dessus
2. Créer une branche dédiée depuis `main`
3. Implémenter la fonctionnalité avec ses tests
4. Mettre à jour ce fichier `TODO.md` en cochant la tâche
5. Ouvrir une Pull Request vers `main`
