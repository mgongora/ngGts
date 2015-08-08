/**
 * Created by coichedid on 21/04/15.
 */
'use strict';
angular.module('nggts.directives').directive('crud', [
  function() {
    return {
      template: '<div></div>',
      restrict: 'EA',
      replace: true,
      scope: {},
      link: function postLink(scope, element, attrs) {
        // Crud directive logic
        // ...

        element.text('this is the crud directive');
      }
    };
  }
]);
