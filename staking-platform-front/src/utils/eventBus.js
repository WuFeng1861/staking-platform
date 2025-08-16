// 简单的事件总线实现
class EventBus {
  constructor() {
    this.events = {};
  }

  // 订阅事件
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  // 取消订阅
  off(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }
  }

  // 触发事件
  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        callback(data);
      });
    }
  }
}

// 创建全局事件总线实例
export const eventBus = new EventBus();

// 定义常用事件名称
export const EVENTS = {
  SHOW_LOADING: 'show_loading',
  HIDE_LOADING: 'hide_loading'
};