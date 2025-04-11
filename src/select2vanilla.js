/* script de base pour faire fonctionner Select2Vanilla */

class Select2Vanilla {

    constructor(objOrSelector, options = {}) {
        const defaultOptions = {
            placeholder: "Sélectionner...",
            width: '100%',
            searchEnabled: options.searchEnabled !== undefined ? options.searchEnabled : true,
            onSelect: null,
            multiple: false,
        };

        this.options = { ...defaultOptions, ...options };
        this.select = typeof objOrSelector === "string" ? document.querySelector(objOrSelector) : objOrSelector;
        /* contrôles de validité de l'objet à gérer */
        if (this.select instanceof NodeList || Array.isArray(this.select)) {
            throw new Error("Select2Vanilla prend en charge un seul <select> à la fois.");
        }
        if (!this.select || this.select.tagName !== "SELECT") {
            console.warm("Sélecteur invalide ou élément non <select>");
            return;
        }

        this._init();
    }

    _init() {
        this._createSelect2Structure();
        /* gestion de la possibilité de recherche */
        if (this.options.searchEnabled) {
            this._addSearch();
        }
        this._bindEvents();
    }

    _createSelect2Structure() {
        /* masquage du select passé en paramètre */
        this.select.style.display = "none";

        /* création de la structure englobant Select2Vanilla */
        const container = document.createElement("div");
        container.classList.add('select2vanilla__container')
        
        // Ajouter le conteneur dans le DOM avant l'élément <select>
        this.select.parentNode.insertBefore(container, this.select);

        // Ajouter le <select> d'origine dans le conteneur
        container.appendChild(this.select);

        // Créer le composant personnalisé
        const customSelect = document.createElement('div');
        customSelect.classList.add('select2-vanilla');
        customSelect.style.width = this.options.width;
        customSelect.innerHTML = `
            <div class="select2-vanilla__selection">
                <span class="select2-vanilla__selected"></span>
            </div>
            <div class="select2-vanilla__dropdown">
                <ul class="select2-vanilla__options"></ul>
            </div>
        `;

        // Ajouter le placeholder si défini
        const placeholder = this.select.getAttribute('placeholder') || this.options.placeholder || '';
        if (placeholder) {
            const spanPlaceholder = document.createElement('span');
            spanPlaceholder.classList.add('select2-vanilla__placeholder');
            spanPlaceholder.textContent = placeholder;
            customSelect.querySelector('.select2-vanilla__selected').appendChild(spanPlaceholder);
        }

        // Ajouter le customSelect et le select dans le conteneur
        container.appendChild(customSelect);

        // Stocker une référence au composant personnalisé
        this.customSelect = customSelect;

        // remplissage du composant persdonalisé
        this._populateOptions();
    }

    _createOptionItem(value, textContent) {
        // Ajouter l'option sélectionnée à la liste des options sélectionnées
        const selectedItem = document.createElement('span');
        selectedItem.classList.add('select2-vanilla__selected-option');
        selectedItem.dataset.value = value;

        const selectedText = document.createElement('span');
        selectedText.classList.add('select2-vanilla__selected-option-text');
        selectedText.textContent = textContent;
        selectedItem.appendChild(selectedText);

        const selectedRemove = document.createElement('span');
        selectedRemove.classList.add('select2-vanilla__selected-option-remove');
        selectedRemove.textContent = 'x';
        selectedItem.appendChild(selectedRemove);

        selectedRemove.addEventListener('click', () => {
            const item = selectedRemove.parentNode;
            // suppression sélection dans this.select
            let selectValue = item.dataset.value;
            let selectOption = this.select.querySelector('[value="' + selectValue + '"]');
            if (selectOption) {
                if (selectOption.classList.contains('createOption')) {
                    selectOption.remove();
                } else {
                    selectOption.selected = false;
                }
            }
            // suppression sélection dans $this.customSelect.querySelector('.select2-vanilla__options')
            let optionLi = this.customSelect.querySelector('.select2-vanilla__option[data-value="' + selectValue + '"]');
            if (optionLi.classList.contains('createOption')) {
                optionLi.remove();
            }
            // Supprimer la sélection
            item.remove();

            this._resetPlaceholder();
        });
        return selectedItem;
    }

    _addSearch() {
        // ajout en début de la zone de saisie pour recherche et ajout de sélection
        const dropDown = this.customSelect.querySelector('.select2-vanilla__dropdown');
        const searchInput = document.createElement('input');
        searchInput.classList.add('select2-vanilla__search');
        searchInput.type = 'text';
        searchInput.placeholder = this.options.placeholder;
        dropDown.prepend(searchInput);

        this._bindInputEvents(searchInput, dropDown);
    }

    _populateOptions() {
        const options = this.select.querySelectorAll('option');
        const optionsList = this.customSelect.querySelector('.select2-vanilla__options');
      
        const optionElements = Array.from(options).map((option) => {
          const optionElement = document.createElement('li');
          optionElement.classList.add('select2-vanilla__option');
          optionElement.dataset.value = option.value;
          optionElement.textContent = option.textContent;
          this._bindOptionEvents(optionElement);
          return optionElement;
        });
      
        optionsList.append(...optionElements);
    }

    _bindEvents() {
        const selection = this.customSelect.querySelector('.select2-vanilla__selection');
        selection.addEventListener('click', () => {
            const dropdown = this.customSelect.querySelector('.select2-vanilla__dropdown');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', (evt) => {
            if (!this.customSelect.contains(evt.target)) {
                this._closeDropdown();  
            }
        })
    }

    _bindOptionEvents(option) {
        option.addEventListener('click', () => {
            this.customSelect.querySelector('.select2-vanilla__placeholder').style.display = 'none';

            // validation de la non présence de l'option choisie
            const optionValue = option.dataset.value;
            const item = this.customSelect.querySelector('.select2-vanilla__selected-option[data-value="'+ optionValue +'"]');
            if (item !== null) {
                this._closeDropdown();
                return;
            }

            if (this.options.multiple) {
                // Choix multiple
                const selectedOptions = this.customSelect.querySelector('.select2-vanilla__selected');
                const selectedOption = this.select.querySelector(`option[value="${option.dataset.value}"]`);
                selectedOption.selected = true;
        
                const selectedItem = this._createOptionItem(option.dataset.value, option.textContent);
                selectedOptions.appendChild(selectedItem);
            } else {
                // Choix unique
                this.select.value = option.dataset.value;
        
                // Ajouter une apparence de bulle avec une croix en haut à droite
                const selectedOption = this.customSelect.querySelector('.select2-vanilla__selected');
                const selectedItem = $this._createOptionItem(option);
                selectedOption.appendChild(selectedItem);
            }
            // Fermer le dropdown après avoir sélectionné une option
            this._closeDropdown();
        });
    }

    _bindInputEvents(input, dropDown) {
        let optionsList = dropDown.querySelectorAll('li');
        let optionsSelected = dropDown.parentNode.querySelector('.select2-vanilla__selected');

        if (!input || !optionsList) {
            return;
        }

        input.addEventListener('input', () => {
            const searchTerm = input.value.trim();
            const options = Array.from(optionsList);
            let hasMatch = false;
        
            options.forEach(option => {
                const optionText = option.textContent.trim();
                const match = optionText.includes(searchTerm);
                option.style.display = match ? 'block' : 'none';
                if (match) hasMatch = true;
            });
            this._hasMatch = hasMatch; // Pour usage dans keydown
        });

        input.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault(); // Empêche le focus/tab par défaut
        
                const searchTerm = input.value.trim();
                if (!searchTerm) {
                    return;
                }
        
                const options = Array.from(optionsList);
                const matchedOption = options.find(option =>
                    option.textContent.trim().indexOf(searchTerm) !== -1
                );
        
                if (matchedOption) {
                    // Évite le doublon si déjà sélectionné
                    if (!matchedOption.classList.contains('selected')) {
                        this._selectOption(matchedOption);
                        const newOption = this._createOptionItem(matchedOption.dataset.value, matchedOption.textContent);
                        optionsSelected.parentNode.appendChild(newOption);
                    }
                } else {
                    // Créer une nouvelle option si rien ne correspond
                    const newOption = this._createOptionItem(searchTerm, searchTerm);
                    optionsSelected.parentNode.appendChild(newOption);
                    this._selectOption(newOption);
                    this._addNewOption(newOption, true);
                }
                this.customSelect.querySelector('.select2-vanilla__placeholder').style.display = 'none';
        
                input.value = ''; // Réinitialiser la saisie
                this._resetOptionsDisplay();
                if (e.key === 'Enter') {
                    this._closeDropdown();
                }
            }
        });
    }

    _closeDropdown() {
        const dropdown = this.customSelect.querySelector('.select2-vanilla__dropdown');
        dropdown.style.display = 'none';
    }

    _openDropdown() {
        const dropdown = this.customSelect.querySelector('.select2-vanilla__dropdown');
        dropdown.style.display = 'block';
    }

    // Méthode pour remettre le placeholder si la zone de sélection est vide
    _resetPlaceholder() {
        const selectedItems = this.customSelect.querySelectorAll('.select2-vanilla__selected-option');
        if (selectedItems.length === 0) {
            this.customSelect.querySelector('.select2-vanilla__placeholder').style.display = 'block';
        }
    }

    _selectOption(optionEl) {
        optionEl.classList.add('selected');
    }

    _resetOptionsDisplay() {
        const options = this.customSelect.querySelectorAll('.select2-vanilla__options li');
        options.forEach(option => {
            option.style.display = 'block';
        });
    }

    _addNewOption(optionEl, selected = false) {
        let newOption = document.createElement('option');
        newOption.classList.add('createOption');
        newOption.value = optionEl.dataset.value;
        newOption.textContent = optionEl.dataset.value;
        if (selected) {
            newOption.selected = true;
        }
        this.select.appendChild(newOption);

        let newOptionLi = document.createElement('li');
        newOptionLi.classList.add('select2-vanilla__option', 'createOption');
        newOptionLi.dataset.value = optionEl.dataset.value;
        newOptionLi.textContent = optionEl.dataset.value;
        this.customSelect.querySelector('.select2-vanilla__options').appendChild(newOptionLi);
    }
}