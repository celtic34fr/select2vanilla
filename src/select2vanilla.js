// Select2Vanilla.js
class Select2Vanilla {
    constructor(selectElement, args = {}) {
        if (!selectElement) {
            return;
        }
        this.initialize(selectElement, args);
    }

    initialize(selectElement, args = {}) {
        this.select = selectElement || null;
        this.events = {
            change: [],
            filter: []
        };
        this.config = Object.assign({
            placeholder: 'Choisir ou saisir',
            choices: [],
            data: [],
            multiple: false,
            allow_add: false,
            removeIconHtml: '×'
        }, args);
        this.container = null;
        this.selectionDiv = null;
        this.input = null;
        this.dropdown = null;
        this.optionsList = null;
        this.options = [];
        this.selectedValues = [];
        this.closeOnOutsideClickHandler = null;

        if (this.select && this.select.parentNode) {
            this.selected = this.select.parentNode.querySelector('.selected');
            if (!this.selected) {
                this.selected = document.createElement('div');
                this.selected.classList.add('selected');
                this.select.parentNode.insertBefore(this.selected, this.select.nextSibling);
            }
            this.init();
        } else {
            this.selected = null;
        }
    }

    // Déclencher les événements
    triggerEvent(eventName, data) {
        if (!this.events) {
            this.events = {
                change: [],
                filter: []
            };
        }

        if (this.events[eventName]) {
            this.events[eventName].forEach(function (callback) {
                callback(data);
            });
        }
    };

    setOption(optionName, value) {
        if (this.config) {
            this.config[optionName] = value;
        }
    }

    getOption(optionName) {
        return this.config ? this.config[optionName] : undefined;
    }

    init() {
        this.buildCustomSelect();
        this.initEvents();
        this.closeOnOutsideClick();

        if (this.config && Object.values(this.config.data).length > 0) {
            let datas = Object.values(this.config.data);
            this.setValues(datas);
        } else if (this.select) {
            // Pré-sélection : reprend les <option selected> rendues par le
            // serveur (formulaire d'édition, valeur par défaut, etc.). On se
            // base sur l'attribut HTML plutôt que sur `selectedOptions`, car
            // un <select> simple sélectionne implicitement sa première option.
            const preselected = Array.from(this.select.options)
                .filter(option => option.defaultSelected && option.value !== '')
                .map(option => ({
                    value: option.value,
                    label: option.textContent
                }));

            if (preselected.length > 0) {
                this.setValues(preselected);
            }
        }
    }

    buildCustomSelect() {
        this.container = document.createElement('div');
        this.container.classList.add('s2v__customSelect');

        this.selectionDiv = document.createElement('div');
        this.selectionDiv.classList.add('s2v__selection');

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.classList.add('s2v__search', 'form-control');
        this.input.placeholder = this.config.placeholder || 'Sélectionner ou saisir';

        this.selectionDiv.appendChild(this.input);

        this.dropdown = document.createElement('div');
        this.dropdown.classList.add('s2v__dropdown');
        this.dropdown.style.display = 'none';

        const ul = document.createElement('ul');
        ul.classList.add('s2v__options');
        this.optionsList = ul;

        if (this.config && Object.values(this.config.choices).length > 0) {
            let choices = Object.values(this.config.choices);
            choices.forEach(choice => {
                const li = document.createElement('li');
                li.textContent = choice.label || choice;
                li.dataset.value = choice.value || choice;
                ul.appendChild(li);
                this.options.push(li);
            });
        } else if (this.select) {
            Array.from(this.select.options).forEach(option => {
                const li = document.createElement('li');
                li.textContent = option.textContent;
                li.dataset.value = option.value;
                ul.appendChild(li);
                this.options.push(li);
            });
        }

        this.dropdown.appendChild(ul);
        this.container.appendChild(this.selectionDiv);
        this.container.appendChild(this.dropdown);

        if (this.select) {
            this.select.style.display = 'none';
            this.select.parentNode.insertBefore(this.container, this.select.nextSibling);
        }
    }

    bindOptionEvents(option) {
        option.addEventListener('click', () => {
            this.addSelectedValue(option.dataset.value, option.textContent);
            this.input.value = '';
            this.filterOptions('');
            this.toggleDropdown(false);
            this.input.focus();
        });
    }

    initEvents() {
        if (!this.options) return;

        this.options.forEach(option => {
            this.bindOptionEvents(option);
        });

        this.selectionDiv.addEventListener('click', () => {
            this.input.focus();
            this.toggleDropdown();
        });

        this.input.addEventListener('input', (e) => {
            this.filterOptions(e.target.value);
            this.toggleDropdown(true);
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = this.input.value.trim();
                if (value === '') return;
                const match = this.options.find(opt => opt.textContent.toLowerCase() === value.toLowerCase());
                if (match) {
                    this.addSelectedValue(match.dataset.value, match.textContent);
                } else if (this.config.allow_add) {
                    this.addSelectedValue(value, value);
                }
                this.input.value = '';
                this.filterOptions('');
                this.toggleDropdown(false);
                this.input.focus();
            }
        });
    }

    addSelectedValue(value, label) {
        if (!this.select) return;
        if (!this.config.multiple && this.selectedValues.length > 0) {
            this.reset();
        }

        if (this.selectedValues.includes(value)) return;

        this.selectedValues.push(value);

        // Réutiliser l'<option> existante : ne jamais ajouter de doublon dans
        // le <select> natif (sinon la valeur est soumise plusieurs fois).
        let option = Array.from(this.select.options).find(opt => opt.value === value);
        if (!option) {
            option = document.createElement('option');
            option.value = value;
            option.text = label;
            this.select.appendChild(option);
        }
        option.selected = true;

        const span = document.createElement('span');
        span.classList.add('s2v__selected');
        span.textContent = label;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.classList.add('s2v__remove');
        removeBtn.innerHTML = this.config.removeIconHtml || '×';
        removeBtn.setAttribute('aria-label', 'Supprimer');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeSelectedValue(value, span);
        });

        span.appendChild(removeBtn);
        this.selectionDiv.insertBefore(span, this.input);

        // Ne pas dupliquer non plus le <li> du dropdown. Pour une valeur libre
        // (allow_add), on l'ajoute réellement à la liste et on l'écoute.
        if (!this.options.some(li => li.dataset.value === value)) {
            const li = document.createElement('li');
            li.textContent = label;
            li.dataset.value = value;
            this.options.push(li);

            if (this.optionsList) {
                this.optionsList.appendChild(li);
                this.bindOptionEvents(li);
            }
        }

        if (this.selected) {
            let hiddenInputId = null;
            const hiddenInputs = this.selected.querySelectorAll('input[type="hidden"]');
            const idx = hiddenInputs.length;
            const baseId = this.selected.getAttribute('id') || 's2v-hidden';
            hiddenInputId = baseId + '_' + idx;

            let hiddenSelected = this.selected.querySelector("input[value='" + value + "']");
            if (!hiddenSelected) {
                hiddenSelected = document.createElement('input');
                hiddenSelected.type = 'hidden';
                hiddenSelected.value = value;
                hiddenSelected.setAttribute('id', hiddenInputId);
                const parts = hiddenInputId.split('_');
                const hiddenInputName = parts[0] + parts.slice(1).map(p => `[${p}]`).join('');
                hiddenSelected.setAttribute('name', hiddenInputName);
                this.selected.appendChild(hiddenSelected);
            }
        }

        this.triggerEvent('change', { value: value, label: label });
    }

    removeSelectedValue(value, spanElement) {
        this.selectedValues = this.selectedValues.filter(v => v !== value);
        if (spanElement && spanElement.parentNode) {
            spanElement.remove();
        }

        // Désélectionner l'<option> existante sans la supprimer : les autres
        // sélections restent intactes et la valeur peut être re-sélectionnée.
        if (this.select) {
            const optionInSelect = Array.from(this.select.options).find(opt => opt.value === value);
            if (optionInSelect) {
                optionInSelect.selected = false;
            }
        }

        if (this.selected) {
            const hiddenInput = this.selected.querySelector('input[value="' + value + '"]');
            if (hiddenInput) {
                hiddenInput.remove();
            }
        }

        this.triggerEvent('change', { value: value, label: null, removed: true });
    }

    filterOptions(searchValue) {
        if (!this.options) return;
        const lowerSearch = (searchValue || '').toLowerCase();
        this.options.forEach(opt => {
            opt.style.display = (opt?.textContent?.toLowerCase().includes(lowerSearch)) ? 'block' : 'none';
        });

        this.triggerEvent('filter', { query: searchValue, options: this.options });
    }

    toggleDropdown(forceOpen = null) {
        if (!this.dropdown) return;
        const isOpen = this.dropdown.style.display === 'block';
        const shouldOpen = forceOpen !== null ? forceOpen : !isOpen;
        this.dropdown.style.display = shouldOpen ? 'block' : 'none';
    }

    closeOnOutsideClick() {
        this.closeOnOutsideClickHandler = (e) => {
            if (!this.container.contains(e.target)) {
                this.toggleDropdown(false);
            }
        };
        document.addEventListener('click', this.closeOnOutsideClickHandler);
    }

    getValues() {
        return [...this.selectedValues];
    }

    reset() {
        if (this.selectionDiv) {
            this.selectionDiv.querySelectorAll('.s2v__selected').forEach(span => span.remove());
        }
        if (this.select) {
            Array.from(this.select.options).forEach(option => option.selected = false);
        }
        this.selectedValues = [];
        if (this.selected) {
            this.selected.querySelectorAll('input[type="hidden"]').forEach(input => input.remove());
        }
    }

    setValues(valuesArray) {
        if (!Array.isArray(valuesArray)) return;

        valuesArray.forEach(item => {
            const option = this.options.find(opt => opt.dataset.value === item.value);
            if (option) {
                this.addSelectedValue(option.dataset.value, option.textContent);
            } else {
                this.addSelectedValue(item.value, item.label);
            }
        });
    }

    destroy() {
        // Retirer les écouteurs globaux
        if (this.closeOnOutsideClickHandler) {
            document.removeEventListener('click', this.closeOnOutsideClickHandler);
            this.closeOnOutsideClickHandler = null;
        }
        // Vider les événements personnalisés
        this.events = { change: [], filter: [] };
        // Supprimer le conteneur custom du DOM
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        // Restaurer l'affichage du select d'origine en conservant la sélection
        if (this.select) {
            this.select.style.display = '';
            Array.from(this.select.options).forEach(option => {
                option.selected = this.selectedValues.includes(option.value);
            });
        }
        this.selectedValues = [];
    }
}

// ✅ Rendre disponible globalement (classe, pas une instance)
window.Select2Vanilla = Select2Vanilla;

export default Select2Vanilla;
