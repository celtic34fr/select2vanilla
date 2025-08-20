// test/select2vanilla.test.js
import Select2Vanilla from './select2vanilla';

describe('Select2Vanilla', () => {
  it('should select an option', () => {
    const select2 = new Select2Vanilla();
    select2.addSelectedValue('option1', 'Option 1');
    expect(select2.getSelectedValue()).toBe('option1');
  });

  it('should filter options', () => {
    const select2 = new Select2Vanilla();
    select2.addOption('option1', 'Option 1');
    select2.addOption('option2', 'Option 2');
    select2.filterOptions('option1');
    expect(select2.getOptions()).toEqual([{ value: 'option1', label: 'Option 1' }]);
  });
});