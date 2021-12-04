export {};  // For some reason this soothes the import process for functions.

const add = require('../src/server_functions/add');

test('two plus two equals four', () => {
    expect(add(2,2)).toBe(4);
});