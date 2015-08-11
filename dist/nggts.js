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
  angular.module('nggts.templates', []);

  angular.module('nggts.directives', []);


  angular.module('nggts.filters', []);


  angular.module('nggts.services', []);


  angular.module('nggts',
      [
        'nggts.config',
        'nggts.templates',
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
angular.module('nggts.directives').directive('gtsCrud', ['$templateCache',function () {
  return {
    scope: {
      title: '@title',
      icon: '@icon',
      columns: '=columns',
      serviceUrl: '@serviceUrl',
      items: '=?items',
      pageSize: '@pageSize',
      currentPage: '=?currentPage',
      filters: '@filters',
      selectIndex: '=?selectedIndex',
      selectedItem: '=?selectedItem',
      onItemAdded: '&onItemAdded',
      onItemChanged: '&onItemChanged',
      onItemRemoved: '&onItemRemoved',
      onSelectedItem: '&onSelectedItem',
      gridTemplate: '@gridTemplate',
      detailsTemplate: '@detailsTemplate',
      editTemplate: '@editTemplate'
    },
    restrict: 'E',
    replace: true,
    template: '<ng-include src="gridTemplate"></ng-include>',
    controller: ['$scope', '$modal', 'ApiClient', function ($scope, $modal, ApiClient) {
      $scope.items = $scope.items || [];
      $scope.gridTemplate = $scope.gridTemplate || 'nggts/directives/crud/crud-list.html';
      $scope.pager = { page: $scope.currentPage || 1, pageSize: $scope.pageSize};

      $scope.get = function () {
        ApiClient.get($scope.serviceUrl + '?page=' + $scope.pager.page + '&pageSize=' + $scope.pager.pageSize)
            .then(function (result) {
            if (result.code !== 0) {
              $scope.items = [];
            } else {
              $scope.items = result.data;
              $scope.pager.totalItems = result.itemsCount;
            }
          },
          function (result) {
            console.log(result);
          });
      };

      $scope.pager.pageChanged = function () {
        //console.log($scope.pager.pag);
        $scope.get();
      };

      $scope.delete = function () { };

      $scope.get();

      $scope.open = function (action, item) {
        if (action === 'new') {
          item = {}; 
          $scope.items.push(item);
        }

        $scope.selectedItem = item;
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: $scope.detailsTemplate || 'nggts/directives/crud/crud-details.html',
          size: 'lg',
          controller: 'CrudDirectiveModalController',
          resolve: {
            model: function () {
              return {
                data: $scope.selectedItem,
                title: $scope.title,
                serviceUrl: $scope.serviceUrl,
                columns: $scope.columns,
                action: action
              };
            }
          }
        });

        modalInstance.result.then(function (result) {
          console.log('Modal closed', result);
        }, function (reason) {
          console.log('Modal dismissed at: ' + reason);
        });
      };
    }]
  };
}])
.controller('CrudDirectiveModalController',
    ['$scope', '$modalInstance', 'ApiClient', 'model',
      function ($scope, $modalInstance, ApiClient, model) {
  $scope.model = model;
  $scope.alert = {};

  $scope.isEditable = function (value) {
    console.log(value);
    if (value === '$form') {
      return $scope.model.action === 'new' || $scope.model.action === 'edit';
    } else {
      return value !== false && ($scope.model.action === 'new' || $scope.model.action === 'edit');
    }
  };

  $scope.formatLabel = function (model, options, valueField, textField) {
    for (var i = 0; i < options.length; i++) {
      if (model === options[i][valueField]) {
        return options[i][textField];
      }
    }
  };

  $scope.showColumn = function (column) {
    return column.visible || column.editable;
  };

  var create = function () {
    ApiClient.post($scope.model.serviceUrl, $scope.model.data).then(function (result) {
      if (result.code !== 0) {
        $scope.showAlert(result.description, 'danger');
      } else {
        $scope.showAlert(result.description, 'success');
      }
    }, function (result) {
      $scope.showAlert('Ocurrió un error, por favor intenta nuevamente', 'danger');
      console.log(result);
    });
  };
  var update = function () {
    ApiClient.put($scope.model.serviceUrl + '/' + getKey(), $scope.model.data).then(function (result) {
      if (result.code !== 0) {
        $scope.showAlert(result.description, 'danger');
      } else {
        $scope.showAlert(result.description, 'success');
      }
    }, function (result) {
      $scope.showAlert('Ocurrió un error, por favor intenta nuevamente', 'danger');
      console.log(result);
    });
  };

  function getKey() {
    var found = false;
    var result = null;
    var i = 0;
    var columns = $scope.model.columns;
    while (!found && i < columns.length) {
      if (columns[i].type === 'key') {
        found = true;
        result = $scope.model.data[columns[i].name];
      }
      i++;
    }
    return result;
  }

  $scope.save = function () {
    var key = getKey();
    if (key != null) {
      update();
    } else {
      create();
    }
  };

  $scope.ok = function () {
    $modalInstance.close($scope.model.data);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.showAlert = function(msg, type){
    $scope.alert.show = true;
    $scope.alert.msg = msg;
    $scope.alert.type = type;
  };

  $scope.closeAlert = function(){
    $scope.alert.show = false;
    $scope.alert.msg = '';
    $scope.alert.type = '';
  };
}
]);


angular.module("nggts.templates").run(["$templateCache", function($templateCache) {$templateCache.put("nggts/directives/crud/crud-details.html","\r\n<div class=\"modal-header\">\r\n  <button ng-click=\"$dismiss(\'exit\')\" type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\"></button>\r\n  <div class=\"caption font-blue\">\r\n    <i class=\"icon-settings font-blue\"></i>\r\n    <span class=\"caption-subject bold uppercase\"> {{model.title}} - {{model.action}}</span>\r\n  </div>\r\n</div>\r\n<div class=\"modal-body\">\r\n  <div class=\"row\">\r\n    <div class=\"col col-md-12 form\">\r\n      <div role=\"form\" class=\"form-horizontal\">\r\n        <div class=\"form-body\">\r\n          <div ng-repeat=\"col in model.columns | filter:showColumn | orderBy:\'position||9999\'\">\r\n            <div class=\"form-group form-md-floating-label\" ng-class=\"{\'form-md-line-input\' : col.type != \'selection\' && col.type != \'multi-selection\', \'form-md-dropdown-input\' : col.type == \'selection\' || col.type == \'multi-selection\'}\">\r\n              <label class=\"col-md-2 control-label\" for=\"{{\'form_control_\'+col.name}}\">{{col.title}}</label>\r\n              <!--text-->\r\n              <div ng-if=\"col.type == \'text\'\" class=\"col-md-10\">\r\n                <input type=\"text\" ng-model=\"model.data[col.name]\" ng-disabled=\"!isEditable(col.editable)\" tabindex=\"{{col.position}}\" class=\"form-control\" id=\"{{\'form_control_\'+col.name}}\" placeholder=\"Ingresar {{col.title}}\">\r\n                <div class=\"form-control-focus\"></div>\r\n              </div>\r\n\r\n              <!--text-->\r\n              <div ng-if=\"col.type == \'password\'\" class=\"col-md-10\">\r\n                <input type=\"password\" ng-model=\"model.data[col.name]\" ng-disabled=\"!isEditable(col.editable)\" tabindex=\"{{col.position}}\" class=\"form-control\" id=\"{{\'form_control_\'+col.name}}\" placeholder=\"Ingresar {{col.title}}\">\r\n                <div class=\"form-control-focus\"></div>\r\n              </div>\r\n\r\n              <!--boolean-->\r\n              <div ng-if=\"col.type == \'boolean\'\" class=\"col-md-10\">\r\n                <div class=\"md-checkbox md-checkbox-inline\">\r\n                  <input ng-model=\"model.data[col.name]\" ng-disabled=\"!isEditable(col.editable)\" type=\"checkbox\" tabindex=\"{{col.position}}\" id=\"{{\'form_control_\'+col.name}}\" class=\"md-check\">\r\n                  <label for=\"{{\'form_control_\'+col.name}}\">\r\n                    <span></span>\r\n                    <span class=\"check\"></span>\r\n                    <span class=\"box\"></span>\r\n                  </label>\r\n                  <div class=\"form-control-focus\"></div>\r\n                </div>\r\n              </div>\r\n\r\n              <!-- foreign key -->\r\n              <div ng-if=\"col.type == \'foreign-key\'\" class=\"col-md-10\" tabindex=\"{{col.position}}\">\r\n                <input type=\"text\" ng-model=\"model.data[col.name]\" ng-disabled=\"!isEditable(col.editable)\" typeahead=\"item[col.value] as item[col.text] for item in col.options | filter:$viewValue | limitTo:8\" typeahead-input-formatter=\"formatLabel($model, col.options, col.value, col.text)\" class=\"form-control\" id=\"{{\'form_control_\'+col.name}}\" placeholder=\"Ingresar {{col.title}}\">\r\n                <div class=\"form-control-focus\"></div>\r\n              </div>\r\n\r\n              <!-- selection -->\r\n              <div ng-if=\"col.type == \'selection\'\" class=\"col-md-10\">\r\n                <ui-select ng-model=\"model.data[col.name]\" theme=\"bootstrap\" ng-disabled=\"!isEditable(col.editable)\">\r\n                  <ui-select-match placeholder=\"Ingrese texto para buscar...\">{{$select.selected[col.text]}}</ui-select-match>\r\n                  <ui-select-choices repeat=\"item[col.value] as item in col.options | filter: $select.search\">\r\n                    <div ng-bind-html=\"item[col.text] | highlight: $select.search\"></div>\r\n                  </ui-select-choices>\r\n                </ui-select>\r\n              </div>\r\n\r\n              <!-- multi selection -->\r\n              <div ng-if=\"col.type == \'multi-selection\'\" class=\"col-md-10\">\r\n                <ui-select multiple ng-model=\"model.data[col.name]\" theme=\"bootstrap\" close-on-select=\"false\" ng-disabled=\"!isEditable(col.editable)\">\r\n                  <ui-select-match placeholder=\"Ingrese texto para buscar...\">{{$item[col.text]}}</ui-select-match>\r\n                  <ui-select-choices repeat=\"item[col.value] as item in col.options | filter: $select.search\">\r\n                    <div ng-bind-html=\"item[col.text] | highlight: $select.search\"></div>\r\n                  </ui-select-choices>\r\n                </ui-select>\r\n              </div>\r\n\r\n            </div>\r\n          </div>\r\n          <alert ng-show=\"alert.show\" type=\"{{alert.type}}\" close=\"closeAlert()\">{{alert.msg}}</alert>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"row\">\r\n\r\n  </div>\r\n</div>\r\n<div class=\"modal-footer\">\r\n  <button ng-click=\"cancel()\" type=\"button\" data-dismiss=\"modal\" class=\"btn btn-default\">Cerrar</button>\r\n  <button ng-click=\"save()\" ng-if=\"isEditable(\'$form\')\" type=\"button\" class=\"btn btn-primary\">Guardar</button>\r\n</div>\r\n");
$templateCache.put("nggts/directives/crud/crud-list.html","<!-- BEGIN EXAMPLE TABLE PORTLET-->\r\n<div class=\"portlet box blue\">\r\n  <div class=\"portlet-title\">\r\n    <div class=\"caption\">\r\n      <i class=\"{{icon}}\"></i>{{title}} - Listado\r\n    </div>\r\n    <div class=\"actions\">\r\n      <a href=\"\" ng-click=\"open(\'new\')\" class=\"btn btn-default btn-sm\">\r\n        <i class=\"fa fa-pencil\"></i> Agregar\r\n      </a>\r\n      <div class=\"btn-group\">\r\n        <a class=\"btn btn-default btn-sm\" href=\"javascript:;\" data-toggle=\"dropdown\">\r\n          <i class=\"fa fa-cogs\"></i> Operaciones <i class=\"fa fa-angle-down\"></i>\r\n        </a>\r\n        <ul class=\"dropdown-menu pull-right\">\r\n          <li>\r\n            <a href=\"javascript:;\">\r\n              <i class=\"fa fa-pencil\"></i> Editar\r\n            </a>\r\n          </li>\r\n          <li>\r\n            <a href=\"javascript:;\">\r\n              <i class=\"fa fa-trash-o\"></i> Borrar\r\n            </a>\r\n          </li>\r\n          <li>\r\n            <a href=\"javascript:;\">\r\n              <i class=\"fa fa-ban\"></i> Bloquear\r\n            </a>\r\n          </li>\r\n        </ul>\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"portlet-body\">\r\n    <div class=\"row\">\r\n      <div class=\"col-md-6 col-sm-12\">\r\n        <div class=\"dataTables_length\" id=\"sample_1_length\">\r\n          <label>\r\n            <select ng-model=\"pager.pageSize\" ng-change=\"pager.pageChanged()\" name=\"sample_1_length\" aria-controls=\"sample_1\" class=\"form-control input-xsmall input-inline\">\r\n              <option value=\"5\">5</option>\r\n              <option value=\"15\">15</option>\r\n              <option value=\"20\">20</option>\r\n              <option value=\"-1\">Todos</option>\r\n            </select> Registros\r\n          </label>\r\n        </div>\r\n      </div>\r\n      <div class=\"col-md-6 col-sm-12\">\r\n        <div id=\"sample_1_filter\" class=\"dataTables_filter\">\r\n          <label>\r\n            Buscar:\r\n            <input type=\"search\" class=\"form-control input-inline input-large\" placeholder=\"\" aria-controls=\"sample_1\">\r\n          </label>\r\n        </div>\r\n      </div>\r\n    </div>\r\n    <table class=\"table table-striped table-bordered table-hover\" id=\"sample_2\">\r\n      <thead>\r\n      <tr>\r\n        <th ng-repeat=\"col in columns | filter:{visible : true} | orderBy:\'position||9999\'\">{{col.title}}</th>\r\n        <th width=\"150px\"></th>\r\n      </tr>\r\n      </thead>\r\n      <tbody>\r\n      <tr ng-repeat=\"item in items\" class=\"odd gradeX\">\r\n        <td ng-repeat=\"col in columns | filter:{visible : true} | orderBy:\'position||9999\'\">\r\n          {{item[col.name]}}\r\n        </td>\r\n        <td>\r\n          <a ng-click=\"open(\'view\', item)\" class=\"btn btn-xs btn-primary\"><i class=\"fa fa-check-square-o\"></i></a>\r\n          <a ng-click=\"open(\'edit\', item)\" class=\"btn btn-xs btn-warning\"><i class=\"fa fa-edit\"></i></a>\r\n          <a ng-click=\"delete(item)\" class=\"btn  btn-xs btn-danger\"><i class=\"fa fa-trash-o\"></i></a>\r\n        </td>\r\n      </tr>\r\n      </tbody>\r\n    </table>\r\n    <div class=\"row\">\r\n      <div class=\"col-md-5 col-sm-12\">\r\n        <div class=\"dataTables_info\" id=\"sample_2_info\" role=\"status\" aria-live=\"polite\">\r\n          Mostrando {{(pager.pageSize * pager.page - pager.pageSize) + 1}} al {{(pager.pageSize * pager.page) <= pager.totalItems ? (pager.pageSize * pager.page) : pager.totalItems}} de {{pager.totalItems}} registros\r\n        </div>\r\n      </div>\r\n      <div class=\"col-md-7 col-sm-12\">\r\n        <div class=\"dataTables_paginate paging_simple_numbers\">\r\n          <pagination boundary-links=\"true\" total-items=\"pager.totalItems\" items-per-page=\"pager.pageSize\" ng-change=\"pager.pageChanged()\" ng-model=\"pager.page\" previous-text=\"&lsaquo;\" next-text=\"&rsaquo;\" first-text=\"&laquo;\" last-text=\"&raquo;\"></pagination>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n<!-- END EXAMPLE TABLE PORTLET-->\r\n");}]);