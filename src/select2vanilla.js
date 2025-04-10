/* script de base pour faire fonctionner Select2Vanilla */

class Select2Vanilla {

    constructor(objOrSelector, options = {}) {
        const defaultOptions = {
            placeholder: "Sélectionner...",
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
        /* gestion de la possibilité de recherche
        if (this.options.searchEnabled) {
            this_addSearch();
        }
        */
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
        customSelect.innerHTML = `
            <div class="select2-vanilla__selection">
                <span class="select2-vanilla__selected"></span>
                <span class="select2-vanilla__arrow"></span>
            </div>
            <div class="select2-vanilla__dropdown">
                <input type="text" class="select2-vanilla__search" placeholder="Rechercher...">
                <ul class="select2-vanilla__options"></ul>
            </div>
        `;

        // Ajouter le placeholder si défini
        const placeholder = this.select.getAttribute('placeholder') || this.options.placeholder || '';
        if (placeholder) {
            customSelect.querySelector('.select2-vanilla__selected').textContent = placeholder;
        }

        // Ajouter le customSelect et le select dans le conteneur
        container.appendChild(customSelect);

        // Stocker une référence au composant personnalisé
        this.customSelect = customSelect;

        // remplissage du composant persdonalisé
        this._populateOptions();
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

    _closeDropdown() {
        const dropdown = this.customSelect.querySelector('.select2-vanilla__dropdown');
        dropdown.style.display = 'none';
    }

    _openDropdown() {
        const dropdown = this.customSelect.querySelector('.select2-vanilla__dropdown');
        dropdown.style.display = 'block';
    }

    _bindOptionEvents(option) {
        option.addEventListener('click', () => {
            if (this.options.multiple) {
                // Choix multiple
                const selectedOptions = this.customSelect.querySelector('.select2-vanilla__selected');
                const selectedOption = this.select.querySelector(`option[value="${optionElement.dataset.value}"]`);
                selectedOption.selected = true;
        
                // Ajouter l'option sélectionnée à la liste des options sélectionnées
                const selectItem = document.createElement('p');
                selectItem.classList.add('select2-vanilla__select_item');
                selectItem.dataset.value = optionElement.dataset.value;
        
                const selectOption = document.createElement('span');
                selectOption.classList.add('select2-vanilla__selected-option-text');
                selectOption.textContent = optionElement.textContent;
                selectItem.appendChild(selectOption);
        
                const selectRemove = document.createElement('span');
                selectRemove.classList.add('select2-vanilla__selected-option-remove');
                selectRemove.textContent = 'x';
                selectItem.appendChild(selectRemove);
        
                selectRemove.addEventListener('click', () => {
                    // Supprimer l'option sélectionnée
                    selectedOption.selected = false;
                    selectItem.remove();
                    this._resetPlaceholder();
                });
        
                selectedOptions.appendChild(selectItem);
            } else {
                // Choix unique
                this.select.value = option.dataset.value;
                this.customSelect.querySelector('.select2-vanilla__selected').textContent = option.textContent;
        
                // Ajouter une apparence de bulle avec une croix en haut à droite
                const selectedOption = this.customSelect.querySelector('.select2-vanilla__selected');
                selectedOption.classList.add('select2-vanilla__selected-option');
                selectedOption.innerHTML = `
                    <span class="select2-vanilla__selected-option-text">${option.textContent}</span>
                    <span class="select2-vanilla__selected-option-remove">×</span>
                `;
        
                // Ajouter un écouteur d'événement pour supprimer la sélection
                selectedOption.querySelector('.select2-vanilla__selected-option-remove').addEventListener('click', () => {
                    // Supprimer la sélection
                    this.select.value = '';
                    this.customSelect.querySelector('.select2-vanilla__selected').textContent = '';
                    this.customSelect.querySelector('.select2-vanilla__selected').classList.remove('select2-vanilla__selected-option');
                    this._resetPlaceholder();
                });
            }
            // Fermer le dropdown après avoir sélectionné une option
            this._closeDropdown();
        });
    }

    // Méthode pour remettre le placeholder si la zone de sélection est vide
    _resetPlaceholder() {
        if (this.customSelect.querySelector('.select2-vanilla__selected').textContent === '') {
            this.customSelect.querySelector('.select2-vanilla__selected').textContent = this.options.placeholder;
        }
    }
}