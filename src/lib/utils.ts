/**
 * @module utils
 * @license MIT
 * @version 2018/05/12
 */

// HTML转义映射表
const HTML_ESCAPE_MAP: Object = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&#39;',
  '"': '&quot;'
};

/**
 * @function escapeHTML
 * @description HTML转义，防止XSS攻击
 * @param {string} html
 * @returns {string}
 */
export function escapeHTML(html: string): string {
  return String(html).replace(/[<>&'"]/g, (char: string) => {
    return HTML_ESCAPE_MAP[char];
  });
}

// 元字符转码正则
const RE_REGEX_ESCAPE: RegExp = /[\[\]\\.^|()*+$:?!-]/g;

/**
 * @function escapeRegex
 * @description 正则元字符转义
 * @param {string} regex
 * @returns {string}
 */
export function escapeRegex(regex: string): string {
  return regex.replace(RE_REGEX_ESCAPE, '\\$&');
}
