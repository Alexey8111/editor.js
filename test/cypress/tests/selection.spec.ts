import * as _ from "../../../src/components/utils";

describe("Blocks selection", () => {
  beforeEach(() => {
    if (this && this.editorInstance) {
      this.editorInstance.destroy();
    } else {
      cy.createEditor({}).as("editorInstance");
    }
  });

  it("should remove block selection on click", () => {
    cy.get("[data-cy=editorjs]")
      .find("div.megasreda-editor-block")
      .click()
      .type("First block{enter}");

    cy.get("[data-cy=editorjs")
      .find("div.megasreda-editor-block")
      .next()
      .type("Second block")
      .type("{movetostart}")
      .trigger("keydown", {
        shiftKey: true,
        keyCode: _.keyCodes.UP,
      });

    cy.get("[data-cy=editorjs")
      .click()
      .find("div.megasreda-editor-block")
      .should("not.have.class", ".megasreda-editor-block--selected");
  });
});
