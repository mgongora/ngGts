'use strict';

describe('Directive: gtsCrudField', function () {

  // load the directive's module
  beforeEach(module('nggtsApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<gts-crud-field></gts-crud-field>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the gtsCrudField directive');
  }));
});
