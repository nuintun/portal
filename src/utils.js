/**
 * @module utils
 * @license MIT
 * @version 2017/12/18
 */

// HTML转义映射表
var HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '\x22': '&#x22;',
  '\x27': '&#x27;'
};

/**
 * @function escapeHTML
 * @description HTML转义，防止XSS攻击
 * @param {string} html
 * @returns {string}
 */
export function escapeHTML(html) {
  return String(html).replace(/[&<>\'\"]/g, function(char) {
    return HTML_ESCAPE_MAP[char];
  });
}

// 元字符转码正则
var RE_REGEX_ESCAPE = /[\[\]\\.^|()*+$:?!-]/g;

/**
 * @function escapeRegex
 * @description 正则元字符转义
 * @param {string} regex
 * @returns {string}
 */
export function escapeRegex(regex) {
  return regex.replace(RE_REGEX_ESCAPE, '\\$&');
}
