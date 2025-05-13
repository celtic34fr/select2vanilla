class Select2Vanilla {
    constructor(selectElement, args = {}) {
        this.select = selectElement;

        // Config par défaut + surcharge avec args
        this.config = Object.assign({
            placeholder: 'Choisir ou saisir',
            choices: [],
            data: [],
            multiple: false,
            allow_add: false
        }, args);

        this.container = null;
        this.selectionDiv = null;
        this.input = null;
        this.dropdown = null;
        this.options = [];
        this.selectedValues = [];

        this.init();
    }

    init() {
        this.buildCustomSelect();
        this.initEvents();
        this.closeOnOutsideClick();

        if (this.config.data.length > 0) {
            this.setValues(this.config.data);
        }
    }

    buildCustomSelect() {
        this.container = document.createElement('div');
        this.container.classList.add('s2v__customSelect');

        this.selectionDiv = document.createElement('div');
        this.selectionDiv.classList.add('s2v__selection');

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.classList.add('s2v__search');
        this.input.placeholder = 'Sélectionner ou saisir';

        this.selectionDiv.appendChild(this.input);

        this.dropdown = document.createElement('div');
        this.dropdown.classList.add('s2v__dropdown');
        this.dropdown.style.display = 'none';

        const ul = document.createElement('ul');
        ul.classList.add('s2v__options');

        // Remplir les options depuis config.choices ou depuis <select>
        if (this.config.choices.length > 0) {
            this.config.choices.forEach(choice => {
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

    initEvents() {
        // Clic sur une option
        this.options.forEach(option => {
            option.addEventListener('click', () => {
                this.addSelectedValue(option.dataset.value, option.textContent);
                this.input.value = '';
                this.filterOptions('');
                this.toggleDropdown(false);
                this.input.focus();
            });
        });

        // Clic sur la sélection pour toggle dropdown
        this.selectionDiv.addEventListener('click', () => {
            this.input.focus();
            this.toggleDropdown();
        });

        // Input de recherche
        this.input.addEventListener('input', (e) => {
            this.filterOptions(e.target.value);
            this.toggleDropdown(true);
        });

        // Validation avec Enter
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = this.input.value.trim();
                if (value === '') return;

                const match = this.options.find(opt => opt.textContent.toLowerCase() === value.toLowerCase());
                if (match) {
                    this.addSelectedValue(match.dataset.value, match.textContent);
                } else {
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
        if (!this.config.multiple && this.selectedValues.length > 0) {
            this.reset();
        }

        if (this.selectedValues.includes(value)) return;

        this.selectedValues.push(value);

        const span = document.createElement('span');
        span.classList.add('s2v__selected');
        span.textContent = label;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.classList.add('s2v__remove');
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => {
            this.removeSelectedValue(value, span);
        });

        span.appendChild(removeBtn);
        this.selectionDiv.insertBefore(span, this.input);

        // Sélectionne dans le select caché si option existe
        if (this.select) {
            const optionInSelect = Array.from(this.select.options).find(opt => opt.value === value);
            if (optionInSelect) optionInSelect.selected = true;
        }
    }

    removeSelectedValue(value, spanElement) {
        this.selectedValues = this.selectedValues.filter(v => v !== value);
        spanElement.remove();

        // Déselectionne dans le select caché
        if (this.select) {
            const optionInSelect = Array.from(this.select.options).find(opt => opt.value === value);
            if (optionInSelect) optionInSelect.selected = false;
        }
    }

    filterOptions(searchValue) {
        const lowerSearch = searchValue.toLowerCase();
        this.options.forEach(opt => {
            opt.style.display = opt.textContent.toLowerCase().includes(lowerSearch) ? 'block' : 'none';
        });
    }

    toggleDropdown(forceOpen = null) {
        const isOpen = this.dropdown.style.display === 'block';
        const shouldOpen = forceOpen !== null ? forceOpen : !isOpen;
        this.dropdown.style.display = shouldOpen ? 'block' : 'none';
    }

    closeOnOutsideClick() {
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.toggleDropdown(false);
            }
        });
    }

    getValues() {
        return [...this.selectedValues];
    }

    reset() {
        this.selectionDiv.querySelectorAll('.s2v__selected').forEach(span => span.remove());
        Array.from(this.select.options).forEach(option => option.selected = false);
        this.selectedValues = [];
    }

    setValues(valuesArray) {
        if (!Array.isArray(valuesArray)) return;

        valuesArray.forEach(value => {
            const option = this.options.find(opt => opt.dataset.value === value);
            if (option) {
                this.addSelectedValue(option.dataset.value, option.textContent);
            } else {
                this.addSelectedValue(value, value);
            }
        });
    }
}
