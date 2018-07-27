/**
 * @module portal
 * @license MIT
 * @version 2018/05/12
 */
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
    constructor(options: {
        open?: string;
        close?: string;
        debug?: boolean;
        strict?: boolean;
    });
    /**
     * @public
     * @method compile
     * @description 编译视图模板
     * @param {string} view 视图模板
     * @returns {Object} { render }
     */
    compile(view: string): {
        render: Function;
    };
    /**
     * @public
     * @method register
     * @description 添加辅助函数
     * @param {string} name 辅助函数名称
     * @param {Function} fn 辅助函数
     * @returns {Portal} Portal
     */
    register(name: string, fn: Function): Portal;
    /**
     * @public
     * @method unregister
     * @description 移除辅助函数
     * @param {string} name 辅助函数名称
     * @returns {Portal} Portal
     */
    unregister(name: string): Portal;
}
