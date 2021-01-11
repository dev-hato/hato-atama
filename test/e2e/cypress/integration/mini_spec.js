describe('短縮URLを生成できる', () => {
  it('三回までは200だが、4回目以降は404が返る', () => {
    const apiHost = Cypress.env('API_HOST');

    cy.visit(apiHost);

    cy.get('input').type(apiHost);

    cy.get('button').click();

    cy.get('a')
      .should('have.attr', 'href')
      .then(($url) => {
        cy.request({ method: 'GET', url: $url }).then((response) => {
          expect(response.status).to.eq(200);
        });
        cy.request({ method: 'GET', url: $url }).then((response) => {
          expect(response.status).to.eq(200);
        });
        cy.request({ method: 'GET', url: $url }).then((response) => {
          expect(response.status).to.eq(200);
        });
        cy.request({ method: 'GET', url: $url, failOnStatusCode: false }).then(
          (response) => {
            expect(response.status).to.eq(404);
          }
        );
      });
  });
});
