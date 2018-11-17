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
     * AMD "require()" implementation
     */
    protected static readonly BROWSER_REQUIRE = 1;
    /**
     * node (CommonJS) "require()" implementation
     */
    protected static readonly NODE_REQUIRE = 2;

    /**
     * Dynamically generated function to call the browser module import
     * method. It is encapsuled to catch browser errors caused by "import"
     * being parsed as a keyword for static imports.
     */
    // tslint:disable-next-line:ban-types
    private static browserImportImplementation: Function;
    /**
     * Flag indicating that the tag name has been registered
     */
    protected static requireImplementation: number = undefined;

    /**
     * Function encapsuled import the given JavaScript modules.
     *
     * @param modules JavaScript module names
     *
     * @return Promise instance
     * @since  v1.0.0
     */
    private static dynamicImport(modules: string[]) {
        let _return;

        if (this.requireImplementation === undefined) {
            try {
                this.browserImportImplementation = new Function(
                    'module',
                    `
if (module.match(/^\\w/)) { module = './' + module + '.js'; }
return import(module);
                `);
            } catch (unhandledException) { /* Fallback */ }
        }

        try {
            if (this.browserImportImplementation !== undefined) {
                _return = Promise.all(modules.map((module) => this.browserImportImplementation(module)));
            }
        } catch (unhandledException) { /* Fallback */ }

        return _return;
    }

    /**
     * Requires the given JavaScript modules.
     *
     * @param modules JavaScript module names
     *
     * @return Promise instance
     * @since  v1.0.0
     */
    public static async require(...modules: string[]) {
        let _return;

        if (
            typeof self == 'undefined'
            || (
                self.djtRequireModulesDisabled !== true
                && self.document.location.protocol.toLowerCase() != 'file:'
            )
        ) {
            _return = this.dynamicImport(modules);
        }

        if (_return) {
            // tslint:disable-next-line:no-any
            _return = _return.then((modulesLoaded: any[]) => {
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
        } else {
            if (this.requireImplementation === undefined && typeof require != 'undefined') {
                this.requireImplementation = (
                    typeof __filename != 'undefined' ?
                    this.NODE_REQUIRE : this.BROWSER_REQUIRE
                );
            }

            _return = new Promise((resolve, reject) => {
                // tslint:disable-next-line:no-any
                const moduleList: any = { };

                switch (this.requireImplementation) {
                    case this.BROWSER_REQUIRE:
                        // @ts-ignore
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

        return _return;
    }
}
