/**
 * @module portal
 * @author nuintun
 * @license MIT
 * @version 0.0.1
 * @description A micro and fast html template engine.
 * @see https://flexui.github.io/portal
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('portal', factory) :
  (global.Portal = factory());
}(this, (function () { 'use strict';

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
  function escapeHTML(html) {
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
  function escapeRegex(regex) {
    return regex.replace(RE_REGEX_ESCAPE, '\\$&');
  }

  /**
   * @module portal
   * @license MIT
   * @version 2017/12/18
   */

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

  // 变量随机标识
  var UID = (+new Date()).toString(32).toUpperCase() + '_';

  // 渲染函数行数变量名
  var VAR_LINE = '_LINE_' + UID;
  // 渲染函数数据变量名
  var VAR_DATA = '_DATA_' + UID;
  // 渲染函数输出变量名
  var VAR_OUTPUT = '_OUTPUT_' + UID;
  // 转义HTML，防止XSS攻击
  var VAR_ESCAPE = '_ESCAPE_' + UID;
  // 渲染函数辅助函数变量名
  var VAR_HELPERS = '_HELPERS_' + UID;

  /**
   * @class Portal
   * @constructor
   * @param {string} open 左分界符
   * @param {string} close 右分界符
   * @returns {Portal}
   */
  function Portal(options) {
    var context = this;

    // 初始化配置
    options = options || {};

    /**
     * @private
     * @property <open>
     * @description 左分界符
     */
    context['<open>'] = new RegExp(escapeRegex(options.open || '<%'), 'g');
    /**
     * @private
     * @property <close>
     * @description 右分界符
     */
    context['<close>'] = new RegExp(escapeRegex(options.close || '%>'), 'g');
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

      // 解析模板
      // prettier-ignore
      var code = "'use strict';\n\n"
        + 'var ' + VAR_LINE + ' = 1;\n'
        + 'var ' + VAR_OUTPUT + " = '';\n\n"
        // 入口
        + 'try {\n  '
        // 模板拼接
        + VAR_OUTPUT + " += '"
        // 模板字符串化
        + String(view)
        // 左分界符
        .replace(context['<open>'], '\x11')
        // 右分界符
        .replace(context['<close>'], '\x13')
        // 单引号转义
        .replace(RE_ESCAPE_QUOTE, '\\x27')
        // 空格去除过滤
        .replace(RE_TRIM_SPACE, '')
        // 拆行
        .replace(RE_LINE_SPLIT, function() {
          return "';\n  " + VAR_LINE + ' = ' + ++row + ';\n  ' + VAR_OUTPUT + " += '\\n";
        })
        // 非转义输出
        .replace(RE_ORIGIN_OUTPUT, "' + ($1) + '")
        // 转义输出
        .replace(RE_ESCAPE_OUTPUT, "' + " + VAR_ESCAPE + "($1) + '")
        // 静态辅助方法调用逻辑处理
        .replace(RE_STATIC_HELPER, '$1' + VAR_HELPERS + '.')
        // 动态辅助方法调用逻辑处理
        .replace(RE_DYNAMIC_HELPER, '$1' + VAR_HELPERS)
        // 静态属性读取逻辑处理
        .replace(RE_STATIC_VARIABLE, '$1' + VAR_DATA + '.')
        // 动态属性读取逻辑处理
        .replace(RE_DYNAMIC_VARIABLE, '$1' + VAR_DATA)
        // 抽取模板逻辑
        .replace(RE_COMPILER_LOGIC, "';\n  $1\n  " + VAR_OUTPUT + " += '")
        // 输出结果
        + "';\n\n  return " + VAR_OUTPUT + ';\n' +
        // 异常捕获
        "} catch (e) {\n  throw 'TemplateError: ' + e + ' (at line ' + " + VAR_LINE + " + ')';\n}";

      /**
       * @function compiler
       * @param {Object|Array} data
       * @param {Function} escape
       * @param {Object} helpers
       * @description 模板渲染引擎
       */
      var compiler = new Function(
        VAR_DATA,
        VAR_ESCAPE,
        VAR_HELPERS,
        code.replace(new RegExp('\x20*' + escapeRegex(VAR_OUTPUT + " += '';") + '\n', 'g'), '')
      );

      /**
       * @function render
       * @param {Object|Array} data
       * @returns {string}
       */
      function render(data) {
        return compiler.call(data, data, escapeHTML, context['<helpers>']);
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

  return Portal;

})));
