/**
 * direct JavaScript Toolbox
 * All-in-one toolbox to provide more reusable JavaScript features
 *
 * (C) direct Netware Group - All rights reserved
 * https://www.direct-netware.de/redirect?djt;promised_require
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/.
 *
 * https://www.direct-netware.de/redirect?licenses;mpl2
 *
 * @license Mozilla Public License, v. 2.0
 */

/**
 * Override for RequireJS function signature.
 */
// tslint:disable-next-line:no-any
declare function require(arg1: any, ...args: any[]): any;
/**
 * Override for browser 'self' context.
 */
// tslint:disable-next-line:no-any
declare var self: any;

/**
 * "PromisedRequire" provides a "require()" implementation for CommonJS as
 * well as AMD based builds in a "Promise" based approach.
 *
 * @author    direct Netware Group
 * @copyright (C) direct Netware Group - All rights reserved
 * @package   djt-promised-require
 * @since     v1.0.0
 * @license   https://www.direct-netware.de/redirect?licenses;mpl2
 *            Mozilla Public License, v. 2.0
 */
export default class PromisedRequire {
    /**
     * Browser dynamic "import()" implementation
     */
    protected static readonly BROWSER_MODULE_IMPORT = 1;
    /**
     * AMD "require()" implementation
     */
    protected static readonly BROWSER_REQUIRE = 2;
    /**
     * node (CommonJS) "require()" implementation
     */
    protected static readonly NODE_REQUIRE = 3;
    /**
     * Function encapsuled import call
     */
    // tslint:disable-next-line:ban-types
    private static dynamicImport: Function;

    /**
     * Flag indicating that the tag name has been registered
     */
    protected static requireImplementation: number = undefined;

    /**
     * Requires the given JavaScript modules.
     *
     * @param modules JavaScript module
     *
     * @return Promise instance
     * @since  v1.0.0
     */
    public static async require(...modules: string[]) {
        let promise;

        if (
            this.requireImplementation === this.BROWSER_MODULE_IMPORT
            || (
                this.requireImplementation === undefined
                && (typeof self == 'undefined' || self.document.location.protocol.toLowerCase() != 'file:')
               )
           ) {
            try {
                if (!this.dynamicImport) {
                    this.dynamicImport = new Function(
                        'module',
                        'if (module.match(/^\\w/)) { module = \'./\' + module + \'.js\'; } return import(module);'
                    );
                }

                promise = Promise.all(modules.map((module) => this.dynamicImport(module)));

                // tslint:disable-next-line:no-any
                promise.then((modulesLoaded: any[]) => {
                    let i = 0;
                    // tslint:disable-next-line:no-any
                    const moduleList: any = { };

                    for (const moduleSpec of modules) {
                        moduleList[moduleSpec] = (
                            modulesLoaded[i].default ? modulesLoaded[i].default : modulesLoaded[i]
                        );

                        i++;
                    }

                    return moduleList;
                });

                if (this.requireImplementation === undefined) {
                    this.requireImplementation = this.BROWSER_MODULE_IMPORT;
                }
            } catch (unhandledException) { /* Fallback */ }
        }

        if (this.requireImplementation === undefined && typeof require != 'undefined') {
            this.requireImplementation = (
                typeof __filename != 'undefined' ?
                this.NODE_REQUIRE : this.BROWSER_REQUIRE
            );
        }

        if (!promise) {
            promise = new Promise((resolve, reject) => {
                // tslint:disable-next-line:no-any
                const moduleList: any = { };

                switch (this.requireImplementation) {
                    case this.BROWSER_REQUIRE:
                        require(
                            modules,
                            (...modulesLoaded: object[]) => {
                                modulesLoaded.forEach((moduleLoaded: object, i: number) => {
                                    moduleList[modules[i]] = moduleLoaded;
                                });

                                resolve(moduleList);
                            },
                            (err: Error) => {
                                reject(err);
                            }
                        );

                        break;
                    case this.NODE_REQUIRE:
                        try {
                            for (const moduleSpec of modules) {
                                const moduleLoaded = require(moduleSpec);

                                moduleList[moduleSpec] = (moduleLoaded.default ? moduleLoaded.default : moduleLoaded);
                            }

                            resolve(moduleList);
                        } catch (handledException) {
                            reject(handledException);
                        }

                        break;
                    default:
                        reject(new Error('No require implementation available'));
                }
            });
        }

        return promise;
    }
}
