// HTML 转码映射表
var HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '\x22': '&#x22;',
  '\x27': '&#x27;'
};

/**
 * HTML转义
 * 防止XSS攻击
 *
 * @export
 * @param {String} html
 */
export function escapeHTML(html) {
  return String(html).replace(/[&<>\'\"]/g, function(char) {
    return HTML_ESCAPE_MAP[char];
  });
}

/**
 * 获取当前时间毫秒
 *
 * @returns {Number}
 */
export var now = Date.now || function() {
  return +new Date();
};

// 元字符转码正则
var RE_REGEX_ESCAPE = /[\[\]\\.^|()*+$:?!-]/g;

/**
 * 正则元字符转义
 *
 * @param string
 * @returns {String}
 */
export function escapeRegex(string) {
  return string.replace(RE_REGEX_ESCAPE, '\\$&');
}
