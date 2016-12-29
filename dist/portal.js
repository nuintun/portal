(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('portal', factory) :
  (global.Portal = factory());
}(this, (function () { 'use strict';

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
  function escapeHTML(html) {
    return String(html).replace(/[&<>\'\"]/g, function(char) {
      return HTML_ESCAPE_MAP[char];
    });
  }

  /**
   * 获取当前时间毫秒
   *
   * @returns {Number}
   */
  var now = Date.now || function() {
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
  function escapeRegex(string) {
    return string.replace(RE_REGEX_ESCAPE, '\\$&');
  }

  // 分行正则
  var RE_LINE_SPLIT = /\n|\r\n/g;
  // 空格过滤正则
  var RE_TRIM_SPACE = /^\s*|\s*$/g;
  // 逻辑抽取正则
  var RE_COMPILER_LOGIC = /\x11\s*(.+?)\s*\x13/g;
  // 转码输出正则
  var RE_ESCAPE_OUTPUT = /\x11=\s*(.+?)\s*\x13/g;
  // 原始输出正则
  var RE_ORIGIN_OUTPUT = /\x11==\s*(.+?)\s*\x13/g;
  // 单引号转码正则
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
   * Portal
   *
   * @constructor
   * @export
   * @param {String} open 左分隔符
   * @param {String} close 右分隔符
   * @returns {Portal}
   */
  function Portal(open, close) {
    var context = this;

    context.open = new RegExp(escapeRegex(open || '<%'), 'g');
    context.close = new RegExp(escapeRegex(close || '%>'), 'g');
  }

  Portal.prototype = {
    // 辅助函数
    helpers: {
      escapeHTML: escapeHTML
    },
    /**
     * 编译视图模板
     *
     * @public
     * @param {String} view 视图模板
     * @returns {Object} { compiler, render } 返回渲染函数和模板编译后的原始函数
     */
    compile: function(view) {
      // 模板必须史字符串
      if ((!view && view !== '') || typeof view.valueOf() !== 'string') {
        throw TypeError('TemplateError: view must be a string');
      }

      // 行数
      var line = 1;
      // 实例指针
      var that = this;
      // 身份标识
      var uid = now();
      // 保存 this 变量
      var context = '__CONTEXT' + uid;
      var helpers = '__HELPERS' + uid;
      var data = '__DATA' + uid;
      // 解析模板
      var code =
        "'use strict';\n\n" +
        // 入口
        "try {\n  " +
        // 保存上下文
        'var ' + context + ' = this;\n  ' +
        'var ' + helpers + ' = ' + context + '.helpers;\n  ' +
        'var ' + data + ' = ' + context + '.data;\n\n  ' +
        // 模板拼接
        context + ".output += '" +
        // 左分界符
        view.replace(that.open, '\x11')
        // 右分界符
        .replace(that.close, '\x13')
        // 单引号转码
        .replace(RE_ESCAPE_QUOTE, '\\x27')
        // 空格去除过滤
        .replace(RE_TRIM_SPACE, '')
        // 拆行
        .replace(RE_LINE_SPLIT, function() {
          return "';\n  " + context + ".line = " + (++line) + ";\n  " + context + ".output += '\\n";
        })
        // 非转码输出
        .replace(RE_ORIGIN_OUTPUT, "' + ($1) + '")
        // 转码输出
        .replace(RE_ESCAPE_OUTPUT, "' + " + helpers + ".escapeHTML($1) + '")
        // 静态辅助方法调用逻辑处理
        .replace(RE_STATIC_HELPER, '$1' + helpers + '.')
        // 动态辅助方法调用逻辑处理
        .replace(RE_DYNAMIC_HELPER, '$1' + helpers)
        // 静态属性读取逻辑处理
        .replace(RE_STATIC_VARIABLE, '$1' + data + '.')
        // 动态属性读取逻辑处理
        .replace(RE_DYNAMIC_VARIABLE, '$1' + data)
        // 静态属性读取逻辑处理
        .replace(RE_STATIC_VARIABLE, '$1' + context + '.data.')
        // 动态属性读取逻辑处理
        .replace(RE_DYNAMIC_VARIABLE, '$1' + context + '.data')
        // 抽取模板逻辑
        .replace(RE_COMPILER_LOGIC, "';\n  $1\n  " + context + ".output += '") +
        // 输出结果
        "';\n\n  return " + context + ".output;\n} catch (e) {\n  " +
        // 异常捕获
        "throw 'TemplateError: ' + e + ' (at ' + ' line ' + " + context + ".line + ')';\n}";

      // 清理正则
      var RE_CLEAN = new RegExp(escapeRegex('\n' + context + ".output += '';") + '\n', 'g');

      // 模板渲染引擎
      var compiler = new Function(code.replace(RE_CLEAN, '\n'));

      // 返回渲染接口
      return {
        compiler: compiler,
        /**
         * render
         *
         * @param {Object|Array} data
         * returns {String}
         */
        render: function(data) {
          return compiler.call({
            line: 1,
            output: '',
            data: data,
            helpers: that.helpers
          });
        }
      }
    },
    /**
     * 添加辅助函数
     *
     * @public
     * @param {String} name
     * @param {Function} fn
     * @returns {Portal}
     */
    addHelper: function(name, fn) {
      if (name === 'escapeHTML') {
        throw 'TemplateError: can not rewrite native helper';
      }

      this.helpers[name] = fn;

      return this;
    },
    /**
     * 移除辅助函数
     *
     * @public
     * @param {String} name
     * @returns {Portal}
     */
    removeHelper: function(name) {
      if (name === 'escapeHTML') {
        throw 'TemplateError: can not remove native helper';
      }

      delete this.helpers[name];

      return this;
    }
  };

  return Portal;

})));
