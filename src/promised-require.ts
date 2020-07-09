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

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

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
     * Dynamically generated function to call the browser module import
     * method. It is encapsuled to catch browser errors caused by "import"
     * being parsed as a keyword for static imports.
     */
    private static browserImportImplementation: any;
    /**
     * Flag indicating that the tag name has been registered
     */
    protected static requireImplementation: any;

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
                // eslint-disable-next-line @typescript-eslint/no-implied-eval
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
    // eslint-disable-next-line @typescript-eslint/require-await
    public static async require(...modules: string[]) {
        let _return;

        if (
            typeof document == 'undefined'
            || typeof self == 'undefined'
            || (
                (typeof djtRequireModulesDisabled == 'undefined' || djtRequireModulesDisabled !== true)
                && document.location.protocol.toLowerCase() !== 'file:'
            )
        ) {
            _return = this.dynamicImport(modules);
        }

        if (_return === undefined) {
            if (this.requireImplementation === undefined) {
                // eslint-disable-next-line @typescript-eslint/no-implied-eval
                this.requireImplementation = new Function(
                    'modules',
                    `
return new Promise(function (resolve, reject) {
    var moduleList = { };

    if (typeof __filename != 'undefined') {
        try {
            for (var i = 0; i < modules.length; i++) {
                var moduleLoaded = require(modules[i]);
                moduleList[modules[i]] = (moduleLoaded.default ? moduleLoaded.default : moduleLoaded);
            }

            resolve(moduleList);
        } catch (handledException) {
            reject(handledException);
        }
    } else {
        require(
            modules,
            function () {
                for (var i = 0; i < arguments.length; i++) {
                    moduleList[modules[i]] = arguments[i];
                }

                resolve(moduleList);
            },
            function (err) {
                reject(err);
            }
        );
    }
});
                `);
            }

            _return = this.requireImplementation(modules);
        } else {
            _return = _return.then((modulesLoaded: any[]) => {
                let i = 0;
                // eslint-disable-next-line
                const moduleList: any = { };

                for (const moduleSpec of modules) {
                    moduleList[moduleSpec] = (
                        modulesLoaded[i].default ? modulesLoaded[i].default : modulesLoaded[i]
                    );

                    i++;
                }

                return moduleList;
            });
        }

        return _return;
    }
}
