import Header from "../../../example/tools/header";
import { BlockMutationType } from "../../../types/events/block/mutation-type";

/**
 * @todo Add checks that correct block API object is passed to onChange
 * @todo Add cases for native inputs changes
 * @todo debug onChange firing on Block Tune toggling (see below)
 */
describe("onChange callback", () => {
  /**
   * Creates Editor instance
   *
   * @param blocks - list of blocks to prefill the editor
   */
  function createEditor(blocks = null): void {
    const config = {
      tools: {
        header: Header,
      },
      onChange: (api, event): void => {
        console.log("something changed", api, event);
      },
      data: blocks
        ? {
            blocks,
          }
        : null,
    };

    cy.spy(config, "onChange").as("onChange");

    cy.createEditor(config).as("editorInstance");
  }

  /**
   * EditorJS API is passed as the first parameter of the onChange callback
   */
  const EditorJSApiMock = Cypress.sinon.match.any;

  it("should fire onChange callback with correct index on block insertion above the current (by pressing Enter at the start)", () => {
    createEditor();

    cy.get("[data-cy=editorjs]").get("div.ce-block").click().type("{enter}");

    cy.get("@onChange").should(
      "be.calledWithMatch",
      EditorJSApiMock,
      Cypress.sinon.match({
        type: BlockMutationType.Added,
        detail: {
          target: {
            name: "paragraph",
          },
          index: 0,
        },
      })
    );
  });

  it("should fire onChange callback with correct index on block insertion below the current (by pressing enter at the end)", () => {
    createEditor();

    cy.get("[data-cy=editorjs]")
      .get("div.ce-block")
      .click()
      .type("some text")
      .type("{enter}");

    cy.get("@onChange").should(
      "be.calledWithMatch",
      EditorJSApiMock,
      Cypress.sinon.match({
        type: BlockMutationType.Added,
        detail: {
          target: {
            name: "paragraph",
          },
          index: 1,
        },
      })
    );
  });

  it("should fire onChange callback on typing into block", () => {
    createEditor();

    cy.get("[data-cy=editorjs]").get("div.ce-block").click().type("some text");

    cy.get("@onChange").should(
      "be.calledWithMatch",
      EditorJSApiMock,
      Cypress.sinon.match({
        type: BlockMutationType.Changed,
        detail: {
          index: 0,
        },
      })
    );
  });

  it("should fire onChange callback on block replacement for both of blocks", () => {
    createEditor();

    cy.get("[data-cy=editorjs]").get("div.ce-block").click();

    cy.get("[data-cy=editorjs]").get("div.ce-toolbar__plus").click();

    cy.get("[data-cy=editorjs]")
      .get("li.megasreda-editor-toolbox__button[data-tool=header]")
      .click();

    cy.get("@onChange").should("be.calledTwice");
    cy.get("@onChange").should(
      "be.calledWithMatch",
      EditorJSApiMock,
      Cypress.sinon.match({
        type: BlockMutationType.Removed,
        detail: {
          index: 0,
          target: {
            name: "paragraph",
          },
        },
      })
    );
    cy.get("@onChange").should(
      "be.calledWithMatch",
      EditorJSApiMock,
      Cypress.sinon.match({
        type: BlockMutationType.Added,
        detail: {
          index: 0,
          target: {
            name: "header",
          },
        },
      })
    );
  });

  it("should fire onChange callback on tune modifying", () => {
    createEditor([
      {
        type: "header",
        data: {
          text: "Header block",
        },
      },
    ]);

    cy.get("[data-cy=editorjs]").get("div.ce-block").click();

    cy.get("[data-cy=editorjs]").get("span.ce-toolbar__settings-btn").click();

    cy.get("[data-cy=editorjs]")
      .get("span.cdx-settings-button[data-level=4]")
      .click()
      /**
       * For some reason, the first click fires the mutation of removeFakeCursor only, so we need to click again.
       * Reproduced only in Cypress.
       *
       * @todo debug it later
       */
      .click();

    cy.get("@onChange").should(
      "be.calledWithMatch",
      EditorJSApiMock,
      Cypress.sinon.match({
        type: BlockMutationType.Changed,
        detail: {
          index: 0,
          target: {
            name: "header",
          },
        },
      })
    );
  });

  it("should fire onChange callback when block is removed", () => {
    createEditor();

    cy.get("[data-cy=editorjs]").get("div.ce-block").click();

    cy.get("[data-cy=editorjs]").get("span.ce-toolbar__settings-btn").click();

    cy.get("[data-cy=editorjs]")
      .get("div.ce-settings__button--delete")
      .click()
      .click();

    cy.get("@onChange").should(
      "be.calledWithMatch",
      EditorJSApiMock,
      Cypress.sinon.match({
        type: BlockMutationType.Removed,
        detail: {
          index: 0,
        },
      })
    );
  });

  it("should fire onChange callback when block is moved", () => {
    createEditor();

    cy.get("[data-cy=editorjs]").get("div.ce-block").click().type("{enter}");

    cy.get("[data-cy=editorjs]").get("div.ce-block").last().click();

    cy.get("[data-cy=editorjs]").get("span.ce-toolbar__settings-btn").click();

    cy.get("[data-cy=editorjs]").get("div.ce-tune-move-up").click();

    cy.get("@onChange").should(
      "be.calledWithMatch",
      EditorJSApiMock,
      Cypress.sinon.match({
        type: BlockMutationType.Moved,
        detail: {
          fromIndex: 1,
          toIndex: 0,
        },
      })
    );
  });
});
