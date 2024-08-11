const DoublyLinkedList = require("./DoublyLinkedList");
const ListNode = require("./ListNode");

class LRUCache {
  constructor(capacity = 100) {
    this.hashMap = new Map();
    this.doublyLinkedList = new DoublyLinkedList();
    this.capacity = capacity;
  }

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
