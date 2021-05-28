/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2021, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * 'License'); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

export default class CreateWizard {
    constructor(openmct, domainObject, parent) {
        this.openmct = openmct;

        this.domainObject = domainObject;
        this.type = openmct.types.get(domainObject.type);

        this.model = domainObject;
        this.parent = parent;
        this.properties = this.type.definition.form || [];
    }

    addNotes(sections) {
        const row = {
            control: 'textarea',
            cssClass: 'l-textarea-sm',
            key: 'notes',
            name: 'Notes',
            required: false,
            value: this.domainObject.notes
        };

        sections.forEach(section => {
            if (section.name !== 'Properties') {
                return;
            }

            section.rows.unshift(row);
        });
    }

    addTitle(sections, includeLocation) {
        let value = `${this.domainObject.name || this.type.definition.name}`;;
        if (includeLocation) {
            value = `Unnamed ${value}`;
        }

        const row = {
            control: 'textfield',
            cssClass: 'l-input-lg',
            key: 'name',
            name: 'Title',
            pattern: '\S+',
            required: true,
            value
        };

        sections.forEach(section => {
            if (section.name !== 'Properties') {
                return;
            }

            section.rows.unshift(row);
        });
    }

    /**
     * Get the form model for this wizard; this is a description
     * that will be rendered to an HTML form. See the
     * platform/forms bundle
     * @param {boolean} includeLocation if true, a 'location' section
     * will be included that will allow the user to select the location
     * of the newly created object, otherwise the .location property of
     * the model will be used.
     */
    getFormStructure(includeLocation) {
        let sections = [];
        let domainObject = this.domainObject;
        let self = this;

        sections.push({
            name: 'Properties',
            rows: this.properties.map(property => {
                    const row = JSON.parse(JSON.stringify(property));
                    row.value = this.getValue(row);

                    return row;
                }).filter(row => row && row.control)
        });

        this.addNotes(sections);
        this.addTitle(sections, includeLocation);

        // Ensure there is always a 'save in' section
        if (includeLocation) {
            function validateLocation(domainObject, data) {
                const parent = data.parentDomainObject;

                return parent && this.openmct.composition.checkPolicy(parent, domainObject);
            }

            sections.push({
                name: 'Location',
                cssClass: 'grows',
                rows: [{
                    name: 'Save In',
                    cssClass: 'grows',
                    control: 'locator',
                    domainObject,
                    parent: this.parent,
                    validate: validateLocation.bind(this),
                    key: 'location'
                }]
            });
        }

        return {
            sections
        };
    }

    getValue(row) {
        if (row.property) {
            return row.property.reduce((acc, property) => acc && acc[property], this.domainObject);
        } else {
            return this.domainObject[row.key];
        }
    }
}