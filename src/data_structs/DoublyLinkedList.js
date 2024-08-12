const ListNode = require("./ListNode");

class DoublyLinkedList {
  /**
   * Initialize the list's head and tail to null.
   */
  constructor() {
    this.head = this.tail = null;
  }

  /**
   * Add a node to the head of the list
   *
   * @param {ListNode} node
   */
  addNodeToHead = (node) => {
    if (!this.head) {
      this.tail = this.head = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
  };

  /**
   * Remove the Node from the tail
   *
   * @returns {ListNode}
   */
  removeNodeFromTail = () => {
    if (!this.tail) return null;

    const removedNode = this.tail;

    if (this.tail.prev) {
      this.tail = this.tail.prev;
      this.tail.next = null;
    } else {
      this.head = this.tail = null;
    }

    return removedNode;
  };

  /**
   * Remove a particular node from any where in the list.
   *
   * @param {ListNode} node - Node to be removed
   * @returns {ListNode}
   */
  removeNode = (node) => {
    if (node === this.head) {
      this.head = this.head.next;
      if (this.head) this.head.prev = null;
    } else if (node === this.tail) {
      this.tail = this.tail.prev;
      if (this.tail) this.tail.next = null;
    } else {
      node.next.prev = node.prev;
      node.prev.next = node.next;
    }
    node.next = node.prev = null;
    return node;
  };
}

module.exports = DoublyLinkedList;
