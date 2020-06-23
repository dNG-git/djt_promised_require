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
 * Global variable deactivating support for ESM.
 */
declare const djtRequireModulesDisabled: boolean;

/**
 * Override for browser 'document' context.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const document: any;

/**
 * Override for browser 'self' context.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const self: any;
