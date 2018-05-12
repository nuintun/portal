/**
 * @module portal
 * @license MIT
 * @version 2018/05/12
 */

import {
  VAR_LINE,
  VAR_DATA,
  VAR_OUTPUT,
  VAR_ESCAPE,
  VAR_HELPERS,
  RE_LINE_SPLIT,
  RE_TRIM_SPACE,
  RE_COMPILER_LOGIC,
  RE_ESCAPE_OUTPUT,
  RE_ORIGIN_OUTPUT,
  RE_ESCAPE_QUOTE,
  RE_STATIC_HELPER,
  RE_DYNAMIC_HELPER,
  RE_STATIC_VARIABLE,
  RE_DYNAMIC_VARIABLE
} from './lib/constants';
import { escapeHTML, escapeRegex } from './lib/utils';

/**
 * @class Portal
 */
export default class Portal {
  /**
   * @constructor
   * @description 构造函数
   * @param {any} options 配置项
   * @param {string} options.open // 左分界符
   * @param {string} options.close // 右分界符
   * @param {boolean} options.debug // 调试模式开关
   * @param {boolean} options.strict // 严格模式开关
   * @returns {Portal} Portal
   */
  constructor(options: { open?: string; close?: string; debug?: boolean; strict?: boolean }) {
    const context: Portal = this;

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

    /**
     * @private
     * @property <debug>
     * @description 模板调试开关
     */
    context['<debug>'] = options.debug;

    /**
     * @private
     * @property <strict>
     * @description 模板函数严格模式开关
     */
    context['<strict>'] = options.strict !== false;
  }

  /**
   * @public
   * @method compile
   * @description 编译视图模板
   * @param {string} view 视图模板
   * @returns {Object} { render }
   */
  compile(view: string): { render: Function } {
    // 行数
    let row: number = 1;
    // 实例指针
    const context: Portal = this;
    // 调试开关
    const debug: boolean = context['<debug>'];
    // 严格模式开关
    const strict: boolean = context['<strict>'];

    // 解析模板
    // prettier-ignore
    const code: string = (strict ? "  'use strict';\n\n" : '')
      + (debug ? '  var ' + VAR_LINE + ' = 1;\n' : '')
      + '  var ' + VAR_OUTPUT + " = '';\n\n"
      // 入口
      + (debug ? 'try {\n  ' : '')
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
        return "';\n  " + (debug ? VAR_LINE + ' = ' + ++row + ';\n  ': '') + VAR_OUTPUT + " += '\\n";
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
      + "';\n\n  return " + VAR_OUTPUT + ';'
      // 异常捕获
      + (debug ? "\n} catch (e) {\n  throw 'TemplateError: ' + e.message + ' (at line ' + " + VAR_LINE + " + ')';\n}" : '');

    /**
     * @function compiler
     * @description 模板渲染引擎
     * @param {Object|Array} data
     * @param {Function} escape
     * @param {Object} helpers
     * @returns {Function}
     */
    const compiler: Function = new Function(
      VAR_DATA,
      VAR_ESCAPE,
      VAR_HELPERS,
      code.replace(new RegExp('\x20*' + escapeRegex(VAR_OUTPUT + " += '';") + '\n', 'g'), '')
    );

    /**
     * @function render
     * @param {Object|any[]} data 模板数据
     * @returns {string} string
     */
    const render = (data: Object | any[]): string => compiler.call(data, data, escapeHTML, context['<helpers>']);

    /**
     * @method toString
     * @description 输出字符串，覆写 toString 方法，使渲染函数显示更友好
     * @returns {string} string
     */
    render.toString = (): string => compiler.toString();

    // 返回渲染接口
    return { render };
  }

  /**
   * @public
   * @method register
   * @description 添加辅助函数
   * @param {string} name 辅助函数名称
   * @param {Function} fn 辅助函数
   * @returns {Portal} Portal
   */
  register(name: string, fn: Function): Portal {
    this['<helpers>'][name] = fn;

    return this;
  }

  /**
   * @public
   * @method unregister
   * @description 移除辅助函数
   * @param {string} name 辅助函数名称
   * @returns {Portal} Portal
   */
  unregister(name: string): Portal {
    delete this['<helpers>'][name];

    return this;
  }
}
