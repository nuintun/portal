(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('portal', factory) :
  (global.Portal = factory());
}(this, (function () { 'use strict';

  // HTML转义映射表
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
   * @param regex
   * @returns {String}
   */
  function escapeRegex(regex) {
    return regex.replace(RE_REGEX_ESCAPE, '\\$&');
  }

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
   * Portal
   *
   * @constructor
   * @export
   * @param {String} open 左分界符
   * @param {String} close 右分界符
   * @returns {Portal}
   */
  function Portal(open, close) {
    var context = this;

    // 左分界符
    context.open = new RegExp(escapeRegex(open || '<%'), 'g');
    // 右分界符
    context.close = new RegExp(escapeRegex(close || '%>'), 'g');
    // 辅助函数
    context.helpers = {};
  }

  Portal.prototype = {
    // 辅助函数
    helpers: {},
    /**
     * 编译视图模板
     *
     * @public
     * @param {String} view 视图模板
     * @returns {Object} { compiler, render } 返回渲染函数和模板编译后的原始函数
     */
    compile: function(view) {
      // 行数
      var row = 1;
      // 实例指针
      var that = this;
      // 变量随机标识
      var uid = now();
      // 渲染函数行数变量名
      var line = '__LINE' + uid;
      // 渲染函数数据变量名
      var data = '__DATA' + uid;
      // 渲染函数输出变量名
      var output = '__OUTPUT' + uid;
      // 渲染函数this变量名
      var context = '__CONTEXT' + uid;
      // 渲染函数辅助函数变量名
      var helpers = '__HELPERS' + uid;
      // 解析模板
      var code =
        "'use strict';\n\n" +
        'var ' + line + ' = 1;\n' +
        'var ' + output + " = '';\n" +
        // 保存上下文
        'var ' + context + ' = this;\n' +
        // 数据引用
        'var ' + data + ' = ' + context + '.data;\n' +
        // 辅助函数引用
        'var ' + helpers + ' = ' + context + '.helpers;\n\n' +
        // 入口
        "try {\n  " +
        // 模板拼接
        output + " += '" +
        // 左分界符
        String(view).replace(that.open, '\x11')
        // 右分界符
        .replace(that.close, '\x13')
        // 单引号转义
        .replace(RE_ESCAPE_QUOTE, '\\x27')
        // 空格去除过滤
        .replace(RE_TRIM_SPACE, '')
        // 拆行
        .replace(RE_LINE_SPLIT, function() {
          return "';\n  " + line + " = " + (++row) + ";\n  " + output + " += '\\n";
        })
        // 非转义输出
        .replace(RE_ORIGIN_OUTPUT, "' + ($1) + '")
        // 转义输出
        .replace(RE_ESCAPE_OUTPUT, "' + " + context + ".escapeHTML($1) + '")
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
        "';\n\n  return " + output + ";\n} catch (e) {\n  " +
        // 异常捕获
        "throw 'TemplateError: ' + e + ' (at ' + ' line ' + " + line + " + ')';\n}";
      // 模板渲染引擎
      var compiler = new Function(code.replace(new RegExp('\x20*' + escapeRegex(output + " += '';") + '\n', 'g'), ''));

      /**
       * render
       *
       * @param {Object|Array} data
       * returns {String}
       */
      function render(data) {
        return compiler.call({
          data: data,
          helpers: that.helpers,
          escapeHTML: escapeHTML
        });
      }

      /**
       * 输出字符串
       * 覆写toString方法，使渲染函数显示更友好
       */
      render.toString = function() {
        return compiler.toString();
      };

      // 返回渲染接口
      return { render: render };
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
      delete this.helpers[name];

      return this;
    }
  };

  return Portal;

})));
