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
 * "PromisedRequire" provides a "require()" implementation for CommonJS as
 * well as AMD based builds in a "Promise" based approach.
 *
 * @since v1.0.0
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
     * Flag indicating that the tag name has been registered
     */
    protected static requireImplementation: number = undefined;

    /**
     * Requires the given JavaScript modules.
     *
     * @param {string[]} modules JavaScript module
     *
     * @return {Promise} Promise
     * @since  v1.0.0
     */
    public static async require(...modules: string[]) {
        if (this.requireImplementation === undefined) {
            if (typeof require != 'undefined') {
                this.requireImplementation = (
                    typeof __filename != 'undefined' ?
                    this.NODE_REQUIRE : this.BROWSER_REQUIRE
                );
            }
        }

        const promise = new Promise((resolve, reject) => {
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

        return promise;
    }
}
