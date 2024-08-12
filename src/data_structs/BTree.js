const { compareKeys, Node } = require("../util/BTreeUtil");

/*
Terms:
- t = the number of keys in a node
- predecessor = the largest key on the left child of a node
- successor = the smallest key on the right child of a node

Properties: 
- All leaves have the same depth
- A node may contain at most 2t - 1 keys 
- A node may contain at minimum t - 1 keys (excluding root)
*/
class BTree {
  /**
   * Initialize the root and t of the B-Tree
   *
   * @param {number} t
   */
  constructor(t = 3) {
    this.root = new Node(true);
    this.t = t;
  }

  /**
   * Search though the B-Tree looking for the key
   *
   * @param {string} key - Key of the value we are searching for
   * @param {Node} node - Node to Start the search from
   * @returns {Object}
   */
  search = (key, node = this.root) => {
    // Start a counter at 0
    let i = 0;

    // Go through the children of the node until we are at the
    // end or if we are less than the current key which would indicate
    // that the value we are looking for, is in the current child node index
    while (i < node.keys.length && compareKeys(key, node.keys[i]) > 0) i++;

    // if we find it return the node and the index of its position in the keys
    // We also check if its less then the length meaning if it reached the end of the keys
    if (i < node.keys.length && compareKeys(key, node.keys[i]) === 0)
      return { key: node.keys[i], value: node.values[i] };
    // Return null if it is a leaf because there is no room for a recussive call
    else if (node.leaf) return null;
    // Search the index that we stopped at when it was at the end of the array or
    // less than the subsequent key
    else return this.search(key, node.children[i]);
  };

  /**
   * Splits a node into 2 nodes, sending its median to the parent node
   * and appending a new child to the parent
   *
   * @param {number} fullNodeIdx - Position of the full node
   * @param {Node} parentNode - Parent of the full node
   */
  splitChild = (fullNodeIdx, parentNode) => {
    const t = this.t;

    // Get the full node that we intend to split
    const fullNode = parentNode.children[fullNodeIdx];

    // Create a new child to hold the split nodes and append it
    // to the children of the parent node
    const newChildNode = new Node(fullNode.leaf);
    parentNode.children.splice(fullNodeIdx + 1, 0, newChildNode);

    // Get the median from the full node and add it to the parent
    // Because we want to create the section where between the median
    // and the previous key will be the keys less than the median,
    // and the opposite for the ones after it
    parentNode.keys.splice(fullNodeIdx, 0, fullNode.keys[t - 1]);
    parentNode.values.splice(fullNodeIdx, 0, fullNode.values[t - 1]);

    // Add the latter half of the full node to the new child
    // (excluding the median because it was already moved)
    newChildNode.keys = fullNode.keys.slice(t);
    newChildNode.values = fullNode.values.slice(t);

    // Replace the keys of the full node with its first half
    fullNode.keys = fullNode.keys.slice(0, t - 1);
    fullNode.values = fullNode.values.slice(0, t - 1);

    // Split the children if it is not a leaf node
    if (!fullNode.leaf) {
      newChildNode.children = fullNode.children.slice(t);
      fullNode.children = fullNode.children.slice(0, t);
    }
  };

  /**
   * Insert a new item to the B-Tree at its key. Handles
   * checking if the root needs to be split before inserting
   *
   * @param {string} newKey - Identifier of an item stored in the B-Tree
   * @param {Object} newValue - Item to be stored
   */
  insert = (newKey, newValue) => {
    const t = this.t;
    const root = this.root;

    // Check if the root has the maximum bound number of keys
    if (root.keys.length === t * 2 - 1) {
      // If it does create a new node to be the root thus increasing the height by
      // then spliting the previous root into 2 parts
      const newRoot = new Node();
      newRoot.children.push(root);
      this.root = newRoot;
      this.splitChild(0, newRoot);
      this.insertNonFull(newRoot, newKey, newValue);
    } else {
      this.insertNonFull(root, newKey, newValue);
    }
  };

  /**
   * Conducts the actual process of setting a new key and value
   * into a node.
   *
   * @param {Node} node - Node to insert the item
   * @param {string} key - Identifier
   * @param {Object} value - Item to be inserted
   */
  insertNonFull = (node, key, value) => {
    const t = this.t;
    let i = node.keys.length - 1;
    if (node.leaf) {
      // If it is a leaf expand the size of the keys by one as a placeholder
      // then iterate from the end to the front until we are at the start or
      // the key is larger than the current key, shifting each key up.
      // Then insert it after that key
      node.keys.push(null);
      while (i >= 0 && compareKeys(key, node.keys[i]) < 0) {
        node.keys[i + 1] = node.keys[i];
        node.values[i + 1] = node.values[i];
        i--;
      }

      i++;
      node.keys[i] = key;
      node.values[i] = value;
    } else {
      // First iterate through the keys until we find the position of
      // the child node where the key should be
      while (i >= 0 && compareKeys(key, node.keys[i]) < 0) i--;
      i++;

      // If the child node is full, split it then check if the key is
      // in the left half of the parent or the right
      if (node.children[i].keys.length === t * 2 - 1) {
        this.splitChild(i, node);
        if (compareKeys(key, node.keys[i]) < 0) i++;
      }

      // Recursively call the function again on the correct child
      this.insertNonFull(node.children[i], key, value);
    }
  };

  /**
   * Remove a node from the B-Tree employing various other
   * helper delete functions based on the delete scenario.
   *
   * @param {string} key - Identifier
   * @param {Node} node - Starting Point
   * @returns {Node}
   *
   */
  delete = (key, node = this.root) => {
    const t = this.t;
    let i = 0;
    key = key.toString();
    // Find the location of the node to remove the key

    // console.log("Before loop:", node.keys, key);
    while (i < node.keys.length && compareKeys(key, node.keys[i]) > 0) {
      i++;
    }
    // console.log("After loop:", node.keys[i], i, node);
    // If the node is a leaf and the key is found,
    // remove the key from the leaf node

    if (node.leaf) {
      if (i < node.keys.length && compareKeys(key, node.keys[i]) === 0) {
        node.keys.splice(i, 1);
        node.values.splice(i, 1);
      }
      return;
    }
    if (i < node.keys.length && compareKeys(key, node.keys[i]) === 0) {
      return this.deleteInternalNode(node, key, i);
    } else if (node.children[i].keys.length >= t) {
      console.log("I am here.", `Going to`, node.children[i]);
      this.delete(key, node.children[i]);
    } else {
      if (i !== 0 && i + 2 < node.children.length) {
        if (node.children[i - 1].keys.length >= t)
          this.deleteSibling(node, i, i - 1);
        else if (node.children[i + 1].keys.length >= t)
          this.deleteSibling(node, i, i + 1);
        else this.deleteMerge(node, i, i + 1);
      } else if (i === 0) {
        if (node.children[i + 1].keys.length >= t)
          this.deleteSibling(node, i, i + 1);
        else this.deleteMerge(node, i, i + 1);
      } else if (i + 1 === node.children.length) {
        if (node.children[i - 1].keys.length >= t)
          this.deleteSibling(node, i, i - 1);
        else this.deleteMerge(node, i, i - 1);
      }
      this.delete(key, node.children[i]);
    }
  };

  /**
   * Remove a node if it is a leaf, has a valid predecessor or successor
   * or if it has neither.
   *
   * @param {Node} node - Node to preform deletion on
   * @param {string} key - Identifier
   * @param {number} i - Index used to view values of the keys and children of the node
   * @returns {Node}
   */
  deleteInternalNode = (node, key, i) => {
    const t = this.t;

    // Base case if we find a leaf node
    if (node.leaf) {
      if (compareKeys(key, node.keys[i]) === 0)
        console.log(node.keys.splice(i, 1), node.values.splice(i, 1));
      return;
    }

    if (node.children[i].keys.length >= t) {
      // Move up and replace the key to be deleted with its predecessor
      // If the left child has t keys
      const predecessor = this.deletePredecessor(node.children[i]);
      node.keys[i] = predecessor.key;
      node.values[i] = predecessor.value;
    } else if (node.children[i + 1].keys.length >= t) {
      // If the right child has t keys move up and replace the key with
      // its successor
      const successor = this.deleteSuccessor(node.children[i + 1]);
      node.keys[i] = successor.key;
      node.values[i] = successor.value;
    } else {
      // If both child nodes have t-1 keys then merge the child nodes
      // and the key to be deleted

      this.deleteMerge(node, i, i + 1);
      this.deleteInternalNode(node.children[i], key, this.t - 1);
    }
  };

  /**
   * Move up the predecessor key to the parent
   *
   * @param {Node} node - Node where the predecessor is located
   * @returns {Node}
   */
  deletePredecessor = (node) => {
    console.log("Moving Up Predecessor");
    // If it is a leaf remove the largest key which is at the end of
    // the keys array
    if (node.leaf) return { key: node.keys.pop(), value: node.values.pop() };

    const n = node.keys.length - 1;
    if (node.children[n].keys.length >= this.t)
      this.deleteSibling(node, n + 1, n);
    else this.deleteMerge(node, n, n + 1);

    return this.deletePredecessor(node.children[n]);
  };

  /**
   * Move up the sucessor key to the parent
   *
   * @param {Node} node - Node where the successor is located
   * @returns {Node}
   */
  deleteSuccessor = (node) => {
    console.log("Moving Up Successor");
    // If it is a leaf remove the smallest key which is at the start of
    // the keys array
    if (node.leaf)
      return { key: node.keys.shift(), value: node.values.shift() };

    if (node.children[1].keys.length >= this.t) this.deleteSibling(node, 0, 1);
    else this.deleteMerge(node, 0, 1);

    return this.deleteSuccessor(node.children[0]);
  };

  /**
   * Merge two child nodes together when there is no valid predecessor
   * or successor to move up on either.
   *
   * @param {Node} node - Parent node of nodes to be merged
   * @param {number} i - Index of first node
   * @param {number} j - Index of second node
   */
  deleteMerge = (node, i, j) => {
    // Set our new child node to the first child of the node passed in
    const childNode = node.children[i];
    let newNode = null;

    if (j > i) {
      // Get the right side child node
      const rightSideNode = node.children[j];

      // Add the key to be deleted to the new child node
      childNode.keys.push(node.keys[i]);
      childNode.values.push(node.values[i]);

      // Populate the child node with the keys from the right child node
      for (let k = 0; k < rightSideNode.keys.length; k++) {
        childNode.keys.push(rightSideNode.keys[k]);
        childNode.values.push(rightSideNode.values[k]);

        // Assign the children of the right side node to the new child node
        if (rightSideNode.children.length > 0) {
          childNode.children.push(rightSideNode.children[k]);
        }
      }

      // Add the last child node of the right side if it exists
      if (rightSideNode.children.length > 0) {
        childNode.children.push(rightSideNode.children.pop());
      }

      // Set the new node to the child node and remove the right child node
      // and the key from the node passed in
      newNode = childNode;
      node.keys.splice(i, 1);
      node.values.splice(i, 1);
      node.children.splice(j, 1);
    } else {
      const leftSideNode = node.children[j];
      leftSideNode.keys.push(node.keys[j]);
      leftSideNode.values.push(node.values[j]);
      for (let i = 0; i < childNode.keys.length; i++) {
        leftSideNode.keys.push(childNode.keys[i]);
        leftSideNode.values.push(childNode.values[i]);
        if (leftSideNode.children.length > 0)
          leftSideNode.children.push(childNode.children[i]);
      }
      if (leftSideNode.children.length > 0)
        leftSideNode.children.push(childNode.children.pop());
      newNode = leftSideNode;
      node.keys.splice(j, 1);
      node.values.splice(j, 1);
      node.children.splice(i, 1);
    }

    // If the node passed was the root set the newly created node to the root
    if (node === this.root && node.keys.length === 0) this.root = newNode;
  };

  /**
   *
   *
   * @param {Node} node - Parent node of the siblings
   * @param {number} i - Index of first node
   * @param {number} j - Index of second node
   */
  deleteSibling = (node, i, j) => {
    const childNode = node.children[i];

    if (i < j) {
      const rightSideNode = node.children[j];
      childNode.keys.push(node.keys[i]);
      childNode.values.push(node.values[i]);
      node.keys[i] = rightSideNode.keys[0];
      node.values[i] = rightSideNode.values[0];
      if (rightSideNode.children.length > 0) {
        childNode.children.push(rightSideNode.children[0]);
        rightSideNode.children.pop();
      }
      rightSideNode.keys.shift();
      rightSideNode.values.shift();
    } else {
      const leftSideNode = node.children[j];
      childNode.keys[0] = node.keys[i - 1];
      childNode.values[0] = node.values[i - 1];
      node.keys[i - 1] = leftSideNode.keys.pop();
      node.values[i - 1] = leftSideNode.values.pop();
      if (leftSideNode.children.length > 0)
        childNode.children[0] = leftSideNode.children.pop();
    }
  };

  /**
   * Print the entire B-Tree nodes.
   *
   * @param {Node} node - Starting point of the traverse
   * @param {number} level - Level of the search
   */
  printTree = (node = this.root, level = 0) => {
    console.log(`Level ${level}`);

    process.stdout.write("Keys: ");
    for (const i of node.keys) process.stdout.write(i + " ");
    process.stdout.write("Values: ");
    for (const i of node.values) process.stdout.write(JSON.stringify(i) + " ");

    console.log("");
    level++;

    if (node.children.length > 0)
      for (const i of node.children) this.printTree(i, level);
  };

  /**
   * Traverse the entire B-Tree returning an array of the Nodes.
   *
   * @param {Node} node - Starting point of the traverse
   * @param {number} level - Level of the search
   * @returns {Node[]}
   */
  traverseTree = (node = this.root, level = 0) => {
    const results = [];

    const traverse = (node, level) => {
      for (const i of node.keys) results.push(i);

      level++;

      if (node.children.length > 0)
        for (const i of node.children) traverse(i, level);
    };

    traverse(node, level);
    return results;
  };

  /**
   * Find a specific set of keys within a given range.
   *
   * @param {string} low - Lower Boundary in the range
   * @param {*} high - Higher Boundary in the range
   * @param {*} node - Starting point for the search
   * @returns
   */
  findInRange = (low, high, node = this.root) => {
    const results = [];

    const traverse = (low, high, node) => {
      let i = 0;
      for (i = 0; i < node.keys.length; i++) {
        // console.log(node.keys[i], node.values[i], low, high);
        if (
          compareKeys(node.keys[i], high) <= 0 &&
          compareKeys(node.keys[i], low) >= 0
        ) {
          if (node.children.length > 0) {
            traverse(low, high, node.children[i]);
          }
          results.push({ key: node.keys[i], value: node.values[i] });
        }
      }

      if (node.children.length > 0) traverse(low, high, node.children[i]);
    };

    traverse(low, high, node);
    return results;
  };

  /**
   * Debug Function for testing other functions
   */
  debug = () => {
    const firstLeaf = new Node(true);
    firstLeaf.keys = ["1", "9"];
    firstLeaf.values = [1, 9];

    const secondLeaf = new Node(true);
    secondLeaf.keys = ["17", "19", "21"];
    secondLeaf.values = [17, 19, 21];

    const thirdLeaf = new Node(true);
    thirdLeaf.keys = ["23", "25", "27"];
    thirdLeaf.values = [23, 25, 27];

    const fourthLeaf = new Node(true);
    fourthLeaf.keys = ["31", "32", "39"];
    fourthLeaf.values = [31, 32, 39];

    const fifthLeaf = new Node(true);
    fifthLeaf.keys = ["41", "47", "50"];
    fifthLeaf.values = [41, 47, 50];

    const sixthLeaf = new Node(true);
    sixthLeaf.keys = ["56", "60"];
    sixthLeaf.values = [56, 60];

    const seventhLeaf = new Node(true);
    seventhLeaf.keys = ["72", "90"];
    seventhLeaf.values = [72, 90];

    const rootLeftChild = new Node();
    rootLeftChild.keys = ["15", "22", "30"];
    rootLeftChild.values = [15, 22, 30];
    rootLeftChild.children.push(firstLeaf, secondLeaf, thirdLeaf, fourthLeaf);

    const rootRightChild = new Node();
    rootRightChild.keys = ["55", "63"];
    rootRightChild.values = [55, 63];
    rootRightChild.children.push(fifthLeaf, sixthLeaf, seventhLeaf);

    const root = new Node();
    root.keys = ["40"];
    root.values = [40];
    root.children.push(rootLeftChild, rootRightChild);

    const B = new BTree(3);
    B.root = root;
    console.log("\n--- Original B-Tree ---\n");
    B.printTree(B.root);

    console.log("\n--- Case 1: DELETED 21 ---\n");
    B.delete(21);
    B.printTree(B.root);

    console.log("\n--- Case 2a: DELETED 30 ---\n");
    B.delete(30);
    B.printTree(B.root);

    console.log("\n--- Case 2b: DELETED 27 ---\n");
    B.delete(27);
    B.printTree(B.root);

    console.log("\n--- Case 2c: DELETED 22 ---\n");
    B.delete(22);
    B.printTree(B.root);

    console.log("\n--- Case 3b: DELETED 17 ---\n");
    B.delete(17);
    B.printTree(B.root);

    console.log("\n--- Case 3a: DELETED 9 ---\n");
    B.delete("9");
    B.printTree(B.root);

    console.log(B.findInRange(56, 72));
  };
}

module.exports = BTree;
