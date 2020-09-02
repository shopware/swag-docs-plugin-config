// / <reference types="Cypress" />

const selector = {
    configElements: [],
};

const configElements = {
    input: {
        label: {
            selector: 'label[for="PluginConfig.config.email"]',
            text: "Email address",
        },
        elementSelector: 'input[name="PluginConfig.config.email"]',
    },
    input_password: {
        type: "input",
        label: {
            selector: 'label[for="PluginConfig.config.secret"]',
            text: "Secret token",
        },
        elementSelector:
            'input[name="PluginConfig.config.secret"][type="password"]',
    },
    input_disabled: {
        label: {
            selector: 'label[for="PluginConfig.config.disabledInputField"]',
            text: "This input field is disabled",
        },
        elementSelector:
            'input[name="PluginConfig.config.disabledInputField"][disabled="disabled"]',
    },
    single_select_mail: {
        options: ["English smtp", "English pop3"], // The Option/s to try
        label: {
            selector: 'label[for="PluginConfig.config.mailMethod"]',
            text: "Mail method",
        },
        elementSelector: 'div[name="PluginConfig.config.mailMethod"]',
    },
    single_select_product: {
        options: ["Cool Product"], // The Option/s to try
        label: {
            selector: 'label[for="PluginConfig.config.exampleProduct"]',
            text: "Select a product...",
        },
        elementSelector: 'div[name="PluginConfig.config.exampleProduct"]',
    },
    multi_select_products: {
        options: ["Cool Product"], // The Option/s to try
        label: {
            selector: 'label[for="PluginConfig.config.exampleMultiProductIds"]',
            text: "Select multiple products...",
        },
        elementSelector:
            ".sw-entity-multi-select > .sw-block-field__block > .sw-select__selection",
    },
    html_editor: {
        label: {
            selector:
                'div[name="PluginConfig.config.textEditor"]>.sw-text-editor__label',
            text: "Write some nice text with WYSIWYG editor",
        },
        elementSelector:
            "div.sw-text-editor div.sw-text-editor__content-editor",
    },
};

describe("Administration: Plugin Config", () => {
    before(() => {
        return cy.createProductFixture();
    });

    beforeEach(() => {
        return cy
            .loginViaApi()
            .then(() => {
                return cy.setLocaleToEnGb();
            })
            .then(() => {
                return cy.visit("/admin#/sw/plugin/settings/PluginConfig");
            });
    });

    it("should have a config button in the context menu", () => {
        cy.visit("/admin#/sw/plugin/index/list");

        // Open the Context Menu of the plugin
        cy.get(".sw-card__content")
            .contains("Label for the plugin PluginConfig")
            .parents("tr")
            .find(".sw-context-button__button")
            .click();

        // Click the context button
        cy.get(".sw-context-menu")
            .contains("Config")
            .click();

        cy.url().should("include", "/admin#/sw/plugin/settings/PluginConfig");
    });

    it("should be able to fill normal inputs", () => {
        const { elementSelector, label } = configElements.input;

        scrollToAndCheckLabel(elementSelector, label);

        cy.get(elementSelector).clearTypeAndCheck("test@shopware.com");
    });

    it("should be able to fill password inputs", () => {
        const { elementSelector, label } = configElements.input_password;

        cy.contains(label.selector, label.text);
        cy.get(elementSelector).scrollIntoView().should("be.visible");

        cy.get(elementSelector).clearTypeAndCheck("test@shopware.com");
    });

    it("should not be able to fill disabled inputs", () => {
        const { elementSelector, label } = configElements.input_disabled;

        cy.contains(label.selector, label.text);
        cy.get(elementSelector).scrollIntoView().should("be.visible");

        cy.get(elementSelector).should("be.disabled");
    });

    context("should be able to use single selects", () => {
        const contexts = {
            single_select_product: "product selection",
            single_select_mail: "mail method selection",
        };

        for (const [keyName, readableName] of Object.entries(contexts)) {
            it(`with ${readableName}`, () => {
                const { options, elementSelector, label } = configElements[keyName];

                cy.contains(label.selector, label.text);
                cy.get(elementSelector).scrollIntoView().should("be.visible");

                for (const option of options) {
                    cy.get(elementSelector).typeSingleSelect(
                        option,
                        elementSelector,
                    );
                }
            });
        }
    });

    it("should be able to use multi selects", () => {
        const {
            options,
            elementSelector,
            label,
        } = configElements.multi_select_products;

        cy.contains(label.selector, label.text);
        cy.get(elementSelector).scrollIntoView().should("be.visible");

        cy.get(elementSelector).typeMultiSelectAndCheck(options[0]);
    });

    it("should be able to upload images", () => {
        cy.get(".sw-media-field__input-container > .sw-button")
            .click();
        cy.get(
            ".sw-media-field__actions_bar > .sw-button > .sw-button__content",
        )
            .click();
        cy.fixture("img/sw-login-background").then((fileContent) => {
            cy.get("#files").upload(
                {
                    fileContent,
                    fileName: "sw-login-background.png",
                    mimeType: "image/png",
                },
                {
                    subjectType: "input",
                },
            );
            cy.get(".sw-media-preview-v2__item").should("be.visible");
        });
    });

    it("should be able to fill the html-editor", () => {
        const { elementSelector, label } = configElements.html_editor;

        cy.contains(label.selector, label.text);
        cy.get(elementSelector).scrollIntoView().should("be.visible");

        cy.get(elementSelector).type("test@shopware.com");
        cy.contains(elementSelector, "test@shopware.com");
    });
});
