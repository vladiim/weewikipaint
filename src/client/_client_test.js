/*global describe, it, expect, dump, wwp*/

(function() {
  "use strict";

  describe('Drawing area', function() {
    it('is initialized in predefined div', function() {
      var div = document.createElement('div');
      div.setAttribute('id', 'wwp-drawingArea');
      document.body.appendChild(div);
      wwp.initializeDrawingArea();
      
      var extractedDiv = document.getElementById('wwp-drawingArea');

      expect(extractedDiv).to.be.ok();
    });
  });

  // describe("Blah", function() {
  //   it("should run", function() {
  //     wwp.createElement();
  //     var extractedDiv = document.getElementById('tdjs');

  //     expect(extractedDiv.getAttribute('foo')).to.equal('bar');
  //   });
  // });
})();