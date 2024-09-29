import { writable } from 'svelte/store';

const messages = writable([]);

export function addMessage(message) {
    messages.set([message]); // 只保留一条消息
}

export function clearMessages() {
    messages.set([]);
}

export function getMessages() {
    return messages;
}