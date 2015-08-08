(function (angular) {

  // Create all modules and define dependencies to make sure they exist
  // and are loaded in the correct order to satisfy dependency injection
  // before all nested files are concatenated by Gulp

  // Config
  angular.module('nggts.config', [])
      .value('nggts.config', {
          debug: true
      });

  // Modules
  
  angular.module('nggts.directives', []);
  
  
  angular.module('nggts.filters', []);
  
  
  angular.module('nggts.services', []);
  
  
  angular.module('nggts',
      [
        'nggts.config',
        'nggts.directives',
        'nggts.filters',
        'nggts.services',
        'ngSanitize'
      ]);

})(angular);

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
