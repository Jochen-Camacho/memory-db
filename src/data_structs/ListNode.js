class ListNode {
  /**
   * Node Class for the DoublyLinkedList
   *
   * @param {string} key
   * @param {Object} value
   */
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.next = this.prev = null;
  }
}

module.exports = ListNode;
