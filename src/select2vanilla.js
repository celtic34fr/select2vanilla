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
    
        options.forEach(option => {
          const optionElement = document.createElement('li');
          optionElement.classList.add('select2-vanilla__option');
          optionElement.dataset.value = option.value;
          optionElement.textContent = option.textContent;
    
          optionsList.appendChild(optionElement);
        });
    }
}