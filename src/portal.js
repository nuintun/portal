/**
 * @module portal
 * @license MIT
 * @version 2017/12/18
 */

import * as Utils from './utils.js';

// 分行正则
var RE_LINE_SPLIT = /\n|\r\n/g;
// 空格过滤正则
var RE_TRIM_SPACE = /^\s*|\s*$/g;
// 逻辑抽取正则
var RE_COMPILER_LOGIC = /\x11\s*(.+?)\s*\x13/g;
// 转义输出正则
var RE_ESCAPE_OUTPUT = /\x11=\s*(.+?)\s*\x13/g;
// 非转义输出正则
var RE_ORIGIN_OUTPUT = /\x11==\s*(.+?)\s*\x13/g;
// 单引号转义正则
var RE_ESCAPE_QUOTE = /'(?![^\x11\x13]+?\x13)/g;
// 静态辅助函数调用正则
var RE_STATIC_HELPER = /(^|[^\w\u00c0-\uFFFF_]):(?=\w)/g;
// 动态辅助函数调用正则
var RE_DYNAMIC_HELPER = /(^|[^\w\u00c0-\uFFFF_]):(?=\[)/g;
// 静态变量输出正则
var RE_STATIC_VARIABLE = /(^|[^\w\u00c0-\uFFFF_])@(?=\w)/g;
// 动态变量输出正则
var RE_DYNAMIC_VARIABLE = /(^|[^\w\u00c0-\uFFFF_])@(?=\[)/g;

/**
 * @class Portal
 * @constructor
 * @param {string} open 左分界符
 * @param {string} close 右分界符
 * @returns {Portal}
 */
export default function Portal(options) {
  var context = this;

  // 初始化配置
  options = options || {};

  /**
   * @private
   * @property <open>
   * @description 左分界符
   */
  context['<open>'] = new RegExp(Utils.escapeRegex(options.open || '<%'), 'g');
  /**
   * @private
   * @property <close>
   * @description 右分界符
   */
  context['<close>'] = new RegExp(Utils.escapeRegex(options.close || '%>'), 'g');
  /**
   * @private
   * @property <helpers>
   * @description 辅助函数映射表
   */
  context['<helpers>'] = {};
}

Portal.prototype = {
  /**
   * @public
   * @method compile
   * @description 编译视图模板
   * @param {string} view 视图模板
   * @returns {Object} { compiler, render } 返回渲染函数和模板编译后的原始函数
   */
  compile: function(view) {
    // 行数
    var row = 1;
    // 实例指针
    var context = this;
    // 变量随机标识
    var uid = +new Date();
    // 渲染函数行数变量名
    var line = '__LINE' + uid;
    // 渲染函数数据变量名
    var data = '__DATA' + uid;
    // 渲染函数输出变量名
    var output = '__OUTPUT' + uid;
    // 转义HTML，防止XSS攻击
    var escape = '__ESCAPE' + uid;
    // 渲染函数辅助函数变量名
    var helpers = '__HELPERS' + uid;

    // 解析模板
    var code =
      "'use strict';\n\n" +
      'var ' +
      line +
      ' = 1;\n' +
      'var ' +
      output +
      " = '';\n\n" +
      // 入口
      'try {\n  ' +
      // 模板拼接
      output +
      " += '" +
      // 左分界符
      String(view)
        .replace(context['<open>'], '\x11')
        // 右分界符
        .replace(context['<close>'], '\x13')
        // 单引号转义
        .replace(RE_ESCAPE_QUOTE, '\\x27')
        // 空格去除过滤
        .replace(RE_TRIM_SPACE, '')
        // 拆行
        .replace(RE_LINE_SPLIT, function() {
          return "';\n  " + line + ' = ' + ++row + ';\n  ' + output + " += '\\n";
        })
        // 非转义输出
        .replace(RE_ORIGIN_OUTPUT, "' + ($1) + '")
        // 转义输出
        .replace(RE_ESCAPE_OUTPUT, "' + " + escape + "($1) + '")
        // 静态辅助方法调用逻辑处理
        .replace(RE_STATIC_HELPER, '$1' + helpers + '.')
        // 动态辅助方法调用逻辑处理
        .replace(RE_DYNAMIC_HELPER, '$1' + helpers)
        // 静态属性读取逻辑处理
        .replace(RE_STATIC_VARIABLE, '$1' + data + '.')
        // 动态属性读取逻辑处理
        .replace(RE_DYNAMIC_VARIABLE, '$1' + data)
        // 抽取模板逻辑
        .replace(RE_COMPILER_LOGIC, "';\n  $1\n  " + output + " += '") +
      // 输出结果
      "';\n\n  return " +
      output +
      ';\n' +
      // 异常捕获
      "} catch (e) {\n  throw 'TemplateError: ' + e + ' (at line ' + " +
      line +
      " + ')';\n}";

    /**
     * @function compiler
     * @param {Object|Array} data
     * @param {Function} escape
     * @param {Object} helpers
     * @description 模板渲染引擎
     */
    var compiler = new Function(
      data,
      escape,
      helpers,
      code.replace(new RegExp('\x20*' + Utils.escapeRegex(output + " += '';") + '\n', 'g'), '')
    );

    /**
     * @function render
     * @param {Object|Array} data
     * @returns {string}
     */
    function render(data) {
      return compiler.call(data, data, Utils.escapeHTML, context['<helpers>']);
    }

    /**
     * @method toString
     * @description 输出字符串，覆写toString方法，使渲染函数显示更友好
     */
    render.toString = function() {
      return compiler.toString();
    };

    // 返回渲染接口
    return { render: render };
  },
  /**
   * @public
   * @method register
   * @description 添加辅助函数
   * @param {string} name
   * @param {Function} fn
   * @returns {Portal}
   */
  register: function(name, fn) {
    this['<helpers>'][name] = fn;

    return this;
  },
  /**
   * @public
   * @method unregister
   * @description 移除辅助函数
   * @param {string} name
   * @returns {Portal}
   */
  unregister: function(name) {
    delete this['<helpers>'][name];

    return this;
  }
};
