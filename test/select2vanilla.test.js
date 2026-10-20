// test/select2vanilla.test.js
import Select2Vanilla from '../src/select2vanilla';

describe('Select2Vanilla', () => {
    let select;
    let container;

    beforeEach(() => {
        // Créer un select dans le DOM jsdom
        container = document.createElement('div');
        document.body.appendChild(container);

        select = document.createElement('select');
        select.id = 'test-select';
        select.innerHTML = `
            <option value="fr">France</option>
            <option value="be">Belgique</option>
            <option value="ch">Suisse</option>
        `;
        container.appendChild(select);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should export the class (not an instance)', () => {
        expect(typeof Select2Vanilla).toBe('function');
        expect(Select2Vanilla.name).toBe('Select2Vanilla');
    });

    it('should define expected prototype methods', () => {
        const proto = Select2Vanilla.prototype;
        expect(typeof proto.initialize).toBe('function');
        expect(typeof proto.addSelectedValue).toBe('function');
        expect(typeof proto.removeSelectedValue).toBe('function');
        expect(typeof proto.filterOptions).toBe('function');
        expect(typeof proto.getValues).toBe('function');
        expect(typeof proto.destroy).toBe('function');
    });

    it('should initialize on a select element', () => {
        const instance = new Select2Vanilla(select, { multiple: true });
        expect(instance).toBeInstanceOf(Select2Vanilla);
        expect(instance.select).toBe(select);
        expect(instance.config.multiple).toBe(true);
        expect(container.querySelector('.s2v__customSelect')).not.toBeNull();
    });

    it('should handle null select element gracefully', () => {
        expect(() => new Select2Vanilla(null)).not.toThrow();
        expect(() => new Select2Vanilla(undefined)).not.toThrow();
    });

    it('should add a selected value', () => {
        const instance = new Select2Vanilla(select, { multiple: true });
        instance.addSelectedValue('fr', 'France');

        expect(instance.getValues()).toContain('fr');
        expect(select.querySelector('option[value="fr"]').selected).toBe(true);
        expect(container.querySelectorAll('.s2v__selected')).toHaveLength(1);
    });

    it('should not add duplicate values', () => {
        const instance = new Select2Vanilla(select, { multiple: true });
        instance.addSelectedValue('fr', 'France');
        instance.addSelectedValue('fr', 'France');

        expect(instance.getValues()).toEqual(['fr']);
    });

    it('should replace value in single mode', () => {
        const instance = new Select2Vanilla(select, { multiple: false });
        instance.addSelectedValue('fr', 'France');
        instance.addSelectedValue('be', 'Belgique');

        expect(instance.getValues()).toEqual(['be']);
    });

    it('should remove a selected value', () => {
        const instance = new Select2Vanilla(select, { multiple: true });
        instance.addSelectedValue('fr', 'France');
        instance.addSelectedValue('be', 'Belgique');

        const span = container.querySelectorAll('.s2v__selected')[0];
        instance.removeSelectedValue('fr', span);

        expect(instance.getValues()).not.toContain('fr');
        expect(instance.getValues()).toContain('be');
        expect(container.querySelectorAll('.s2v__selected')).toHaveLength(1);
        expect(select.querySelector('option[value="fr"]').selected).toBe(false);
    });

    it('should return selected values', () => {
        const instance = new Select2Vanilla(select, { multiple: true });
        instance.addSelectedValue('fr', 'France');
        instance.addSelectedValue('ch', 'Suisse');

        expect(instance.getValues()).toEqual(['fr', 'ch']);
    });

    it('should reset all selections', () => {
        const instance = new Select2Vanilla(select, { multiple: true });
        instance.addSelectedValue('fr', 'France');
        instance.addSelectedValue('be', 'Belgique');

        instance.reset();

        expect(instance.getValues()).toEqual([]);
        expect(container.querySelectorAll('.s2v__selected')).toHaveLength(0);
    });

    it('should set multiple values at once', () => {
        const instance = new Select2Vanilla(select, { multiple: true });
        instance.setValues([
            { value: 'fr', label: 'France' },
            { value: 'ch', label: 'Suisse' },
        ]);

        expect(instance.getValues()).toEqual(['fr', 'ch']);
    });

    it('should filter options by search text', () => {
        const instance = new Select2Vanilla(select, { multiple: true });
        instance.filterOptions('fra');

        const options = container.querySelectorAll('.s2v__options li');
        const visibleOptions = Array.from(options).filter(li => li.style.display !== 'none');
        expect(visibleOptions.length).toBe(1);
        expect(visibleOptions[0].textContent).toBe('France');
    });

    it('should toggle dropdown', () => {
        const instance = new Select2Vanilla(select, { multiple: true });

        instance.toggleDropdown(true);
        expect(instance.dropdown.style.display).toBe('block');

        instance.toggleDropdown(false);
        expect(instance.dropdown.style.display).toBe('none');
    });

    it('should destroy and clean up DOM', () => {
        const instance = new Select2Vanilla(select, { multiple: true });
        instance.addSelectedValue('fr', 'France');

        instance.destroy();

        expect(container.querySelector('.s2v__customSelect')).toBeNull();
        expect(select.style.display).toBe('');
        expect(instance.getValues()).toEqual([]);
    });

    it('should expose removeIconHtml option', () => {
        const instance = new Select2Vanilla(select, {
            multiple: true,
            removeIconHtml: '<i class="fa fa-times"></i>',
        });
        expect(instance.getOption('removeIconHtml')).toBe('<i class="fa fa-times"></i>');
    });

    it('should trigger change event on add', () => {
        const instance = new Select2Vanilla(select, { multiple: true });
        const callback = vi.fn();
        instance.events.change.push(callback);

        instance.addSelectedValue('fr', 'France');

        expect(callback).toHaveBeenCalledWith({ value: 'fr', label: 'France' });
    });

    it('should trigger change event on remove', () => {
        const instance = new Select2Vanilla(select, { multiple: true });
        const callback = vi.fn();
        instance.events.change.push(callback);

        instance.addSelectedValue('fr', 'France');
        const span = container.querySelector('.s2v__selected');
        instance.removeSelectedValue('fr', span);

        expect(callback).toHaveBeenCalledWith({ value: 'fr', label: null, removed: true });
    });
});
