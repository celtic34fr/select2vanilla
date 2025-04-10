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
        customSelect.style.width = this.options.width;
        customSelect.innerHTML = `
            <div class="select2-vanilla__selection">
                <span class="select2-vanilla__selected"></span>
            </div>
            <div class="select2-vanilla__dropdown">
                <input type="text" class="select2-vanilla__search" placeholder="Rechercher...">
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
            this.customSelect.querySelector('.select2-vanilla__placeholder').style.display = 'none';

            // validation de la non présence de l'option choisie
            const item = this.customSelect.querySelector('select2-vanilla__selected-option[data-value="${option.dataset.value}"]');
            if (item !== null) {
                return;
            }

            if (this.options.multiple) {
                // Choix multiple
                const selectedOptions = this.customSelect.querySelector('.select2-vanilla__selected');
                const selectedOption = this.select.querySelector(`option[value="${option.dataset.value}"]`);
                selectedOption.selected = true;
        
                // Ajouter l'option sélectionnée à la liste des options sélectionnées
                const selectedItem = document.createElement('span');
                selectedItem.classList.add('select2-vanilla__selected-option');
                selectedItem.dataset.value = option.dataset.value;
        
                const selectedText = document.createElement('span');
                selectedText.classList.add('select2-vanilla__selected-option-text');
                selectedText.textContent = option.textContent;
                selectedItem.appendChild(selectedText);
        
                const selectedRemove = document.createElement('span');
                selectedRemove.classList.add('select2-vanilla__selected-option-remove');
                selectedRemove.textContent = 'x';
                selectedItem.appendChild(selectedRemove);
        
                selectedRemove.addEventListener('click', () => {
                    const item = selectedRemove.parentNode;
                    // Supprimer la sélection
                    selectedOption.selected = false;
                    item.remove();
                    this._resetPlaceholder();
                });
        
                selectedOptions.appendChild(selectedItem);
            } else {
                // Choix unique
                this.select.value = option.dataset.value;
        
                // Ajouter une apparence de bulle avec une croix en haut à droite
                const selectedOption = this.customSelect.querySelector('.select2-vanilla__selected');
                const selectedItem = document.createElement('span');
                selectedItem.classList.add('select2-vanilla__selected-option');
                selectedItem.dataset.value = option.dataset.value;
                const selectedText = document.createElement('span');
                selectedText.classList.add('select2-vanilla__selected-option-text');
                selectedText.textContent = option.textContent;
                selectedItem.appendChild(selectedText);
                const selectedRemove = document.createElement('span');
                selectedRemove.classList.add('select2-vanilla__selected-option-remove');
                selectedRemove.textContent = '×';
                selectedItem.appendChild(selectedRemove);
                selectedOption.appendChild(selectedItem);
        
                // Ajouter un écouteur d'événement pour supprimer la sélection
                selectedRemove.addEventListener('click', () => {
                    const item = selectedRemove.parentNode;
                    // Supprimer la sélection
                    this.select.value = '';
                    item.remove();
                    this._resetPlaceholder();
                });
            }
            // Fermer le dropdown après avoir sélectionné une option
            this._closeDropdown();
        });
    }

    // Méthode pour remettre le placeholder si la zone de sélection est vide
    _resetPlaceholder() {
        const selectedItems = this.customSelect.querySelectorAll('.select2-vanilla__select-option');
        if (selectedItems.length === 0) {
            this.customSelect.querySelector('.select2-vanilla__placeholder').style.display = 'block';
        }
    }
}