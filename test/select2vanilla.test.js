// test/select2vanilla.test.js
import Select2Vanilla from './select2vanilla';

describe('Select2Vanilla', () => {
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
});
