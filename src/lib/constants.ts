/**
 * @module constants
 * @license MIT
 * @version 2018/05/12
 */

// 分行正则
export const RE_LINE_SPLIT = /\n|\r\n/g;
// 空格过滤正则
export const RE_TRIM_SPACE = /^\s*|\s*$/g;
// 逻辑抽取正则
export const RE_COMPILER_LOGIC = /\x11\s*(.+?)\s*\x13/g;
// 转义输出正则
export const RE_ESCAPE_OUTPUT = /\x11=\s*(.+?)\s*\x13/g;
// 非转义输出正则
export const RE_ORIGIN_OUTPUT = /\x11==\s*(.+?)\s*\x13/g;
// 单引号转义正则
export const RE_ESCAPE_QUOTE = /'(?![^\x11\x13]+?\x13)/g;
// 静态辅助函数调用正则
export const RE_STATIC_HELPER = /(^|[^\w\u00c0-\uFFFF_]):(?=\w)/g;
// 动态辅助函数调用正则
export const RE_DYNAMIC_HELPER = /(^|[^\w\u00c0-\uFFFF_]):(?=\[)/g;
// 静态变量输出正则
export const RE_STATIC_VARIABLE = /(^|[^\w\u00c0-\uFFFF_])@(?=\w)/g;
// 动态变量输出正则
export const RE_DYNAMIC_VARIABLE = /(^|[^\w\u00c0-\uFFFF_])@(?=\[)/g;

// 变量随机标识
const UID = (+new Date()).toString(32).toUpperCase() + '_';

// 渲染函数行数变量名
export const VAR_LINE = '_LINE_' + UID;
// 渲染函数数据变量名
export const VAR_DATA = '_DATA_' + UID;
// 渲染函数输出变量名
export const VAR_OUTPUT = '_OUTPUT_' + UID;
// 转义HTML，防止XSS攻击
export const VAR_ESCAPE = '_ESCAPE_' + UID;
// 渲染函数辅助函数变量名
export const VAR_HELPERS = '_HELPERS_' + UID;
