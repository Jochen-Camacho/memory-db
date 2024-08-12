/**
 * Compare keys where maybe be strings or numbers.
 *
 * @param {string} key1
 * @param {string} key2
 * @returns
 */

const compareKeys = (key1, key2) => {
  const isKey1Number = !isNaN(Number(key1));
  const isKey2Number = !isNaN(Number(key2));

  if (isKey1Number && isKey2Number) {
    return Number(key1) - Number(key2); // Numeric comparison
  } else if (!isKey1Number && !isKey2Number) {
    return key1.localeCompare(key2); // String comparison
  } else if (isKey1Number) {
    return -1; // Number is considered less than string
  } else {
    return 1; // String is considered greater than number
  }
};

class Node {
  /**
   * Node Class used for nodes in the BTree.
   *
   * @param {boolean} leaf - Check wether the node is a leaf
   */

  constructor(leaf = false) {
    this.keys = [];
    this.values = [];
    this.children = [];
    this.leaf = leaf;
  }
}

module.exports = { compareKeys, Node };
