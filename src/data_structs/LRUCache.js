const DoublyLinkedList = require("./DoublyLinkedList");
const ListNode = require("./ListNode");

class LRUCache {
  /**
   * Creates a Cache DS with a Map for Retrieval and Storage,
   * a Doubly Linked List for managing recently used items and
   * a capacity to limit the size of the cache.
   *
   * @param {number} capacity - Number of nodes that can be held in cache
   */
  constructor(capacity = 100) {
    this.hashMap = new Map();
    this.doublyLinkedList = new DoublyLinkedList();
    this.capacity = capacity;
  }

  /**
   * Retrieves the value of the key entered.
   *
   * @param {string} key - Key of item being retrieved
   * @returns {Object}
   */
  get = (key) => {
    const node = this.hashMap.get(key);
    if (node) {
      // Move the node to the top of the doubly linked list
      this.doublyLinkedList.removeNode(node);
      this.doublyLinkedList.addNodeToHead(node);
      return node.value;
    } else {
      return null; // Null if not found
    }
  };

  /**
   * Set a new value to the cache
   *
   * @param {string} key - Key of value to be set
   * @param {Object} value - Value to be set
   */
  set = (key, value) => {
    // If the node exists remove it from the doubly linked list
    if (this.hashMap.has(key)) {
      const temp = this.hashMap.get(key);
      this.doublyLinkedList.removeNode(temp);
    }

    // Create the new node
    const node = new ListNode(key, value);

    // Set/Update it in the hash map and add it to the top
    this.hashMap.set(key, node);
    this.doublyLinkedList.addNodeToHead(node);

    // If the LRU Cache overflows its capacity remove the least used node
    if (this.hashMap.size > this.capacity) {
      const node = this.doublyLinkedList.removeNodeFromTail();
      this.hashMap.delete(node.key);
    }
  };

  /**
   * Remove a value from the cache
   *
   * @param {string} key - Key of value to be removed
   * @returns {Object}
   */
  delete = (key) => {
    if (!this.hashMap.has(key)) {
      return false;
    }
    const node = this.hashMap.get(key);
    this.hashMap.delete(key);
    this.doublyLinkedList.removeNode(node);
    return true;
  };
}

module.exports = LRUCache;
