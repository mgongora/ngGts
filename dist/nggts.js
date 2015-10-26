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

angular.module('nggts.directives')
.directive('gtsCrud', ['$templateCache', '$compile', function ($templateCache, $compile) {
    function isFunction(functionToCheck) {
      var getType = {};
      return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    function getFieldTemplate(columnType) {
      var templates = {
        text: '<div class="form-group form-md-floating-label form-md-line-input">\n\
        <label class="col-md-2 control-label" for="txt_[col-name]">[col-title]</label>\n\
        <div class="col-md-10">\n\
         <input type="text" ng-model="model.data.[col-name]" ng-disabled="!isEditable([col-editable])" tabindex="[col-position]"\n\
           class="form-control" id="txt_[col-name]" placeholder="Ingresar [col-title]">\n\
         <div class="form-control-focus"></div>\n\
        </div>\n\
      </div>\n',

        date: '<div class="form-group form-md-floating-label form-md-line-input">\n\
        <label class="col-md-2 control-label" for="dat_[col-name]}}">[col-title]</label>\n\
        <div class="col-md-10">\n\
          <input class="form-control form-control-inline input-medium date-picker" size="16" type="text"  gts-date-picker \
            data-autoclose="true" data-language="es" data-today-highlight="true" data-date-format="dd-mm-yyyy" data-date-start-date="+0d"\n\
            data-model="model.data.[col-name]" ng-disabled="!isEditable([col-editable])" tabindex="[col-position]" id="dat_[col-name]"\n\
            class="success" />\n\
            <div class="form-control-focus"></div>\n\
        </div>\n\
      </div>\n',

        password: '<div class="form-group form-md-floating-label form-md-line-input">\n\
        <label class="col-md-2 control-label" for="pwd_[col-name]">[col-title]</label>\n\
        <div class="col-md-10">\n\
          <input type="password" ng-model="model.data.[col-name]" ng-disabled="!isEditable([col-editable])" tabindex="[col-position]"\n\
            class="form-control" id="pwd_[col-name]" placeholder="Ingresar [col-title]">\n\
          <div class="form-control-focus"></div>\n\
        </div>\n\
      </div>\n',

        boolean: '<div class="form-group form-md-floating-label form-md-line-input">\n\
        <label class="col-md-2 control-label" for="ckx_[col-name]">[col-title]</label>\n\
        <div class="md-checkbox md-checkbox-inline">\n\
          <input ng-model="model.data.[col-name]" ng-disabled="!isEditable([col-editable])" type="checkbox"\n\
           tabindex="[col-position]" id="ckx_[col-name]" class="md-check">\n\
          <label>\n\
            <span></span>\n\
            <span class="check"></span>\n\
            <span class="box"></span>\n\
          </label>\n\
          <div class="form-control-focus"></div>\n\
        </div>\n\
      </div>\n',

        foreignKey: '<div class="form-group form-md-floating-label">\n\
        <label class="col-md-2 control-label" for="cbx_[col-name]">[col-title]</label>\n\
        <div class="col-md-10" tabindex="[col-position]">\n\
          <input type="text" ng-model="model.data.[col-name]" ng-disabled="!isEditable([col-editable])" \
          typeahead="item.[col-value] as item.[col-text] for item in [col-options] | filter:$viewValue | limitTo:8" \
          typeahead-input-formatter="formatLabel($model, [col-options], [col-value], [col-text])" class="form-control" \
          id="cbx_[col-name]" placeholder="Ingresar [col-title]">\n\
          <div class="form-control-focus"></div>\n\
        </div>\n\
      </div>\n',

        selection: '<div class="form-group form-md-floating-label form-md-dropdown-input">\n\
        <label class="col-md-2 control-label" for="cbx_[col-name]">[col-title]</label>\n\
        <div class="col-md-10">\n\
          <ui-select id="cbx_[col-name]" ng-model="model.data.[col-name]" theme="bootstrap" ng-disabled="!isEditable([col-editable])">\n\
            <ui-select-match placeholder="Ingrese texto para buscar...">{{$select.selected.[col-text]}}</ui-select-match>\n\
            <ui-select-choices repeat="item.[col-value] as item in [col-options] | filter: $select.search">\n\
              <div ng-bind-html="item.[col-text] | highlight: $select.search"></div>\n\
            </ui-select-choices>\n\
          </ui-select>\n\
        </div>\n\
      </div>\n',

        multiSelection: '<div class="form-group form-md-floating-label form-md-dropdown-input">\n\
        <label class="col-md-2 control-label" for="cbx_[col-name]">{{[col-title]}}</label>\n\
        <div class="col-md-10">\n\
          <ui-select multiple id="cbx_[col-name]" ng-model="model.data.[col-name]" theme="bootstrap" close-on-select="false"\n\
          ng-disabled="!isEditable([col-editable])">\n\
            <ui-select-match placeholder="Ingrese texto para buscar...">{{$item.[col-text]}}</ui-select-match>\n\
            <ui-select-choices repeat="item.[col-value] as item in [col-options] | filter: $select.search">\n\
              <div ng-bind-html="item.[col-text] | highlight: $select.search"></div>\n\
            </ui-select-choices>\n\
          </ui-select>\n\
        </div>\n\
      </div>\n',

        details: '<div class="form-group form-md-floating-label">\n\
      </div>\n'
      };
      return templates[columnType];
    }

    function getEditTemplate(columns) {
      var tpl =
        '<div class="row">\n\
          <div class="col col-md-12 form">\n\
            <div role="form" class="form-horizontal">\n\
              <div class="form-body">\n';
      console.log('columnas en getEdit', columns);
      var filteredColumns = _.sortBy(_.where(columns, {editable: true}), function (item) {
        return item.position || 9999999;
      });
      for (var i = 0; i < filteredColumns.length; i++) {
        var col = filteredColumns[i];
        var columnTpl = getFieldTemplate(col.type);
        columnTpl = columnTpl.replace(/\[col-name]/g, col.name)
          .replace(/\[col-title]/g, col.title)
          .replace(/\[col-position]/g, col.position)
          .replace(/\[col-editable]/g, col.editable)
          .replace(/\[col-position]/g, col.position)
          .replace(/\[col-text]/g, col.text)
          .replace(/\[col-value]/g, col.value)
          .replace(/\[col-options]/g, col.options);
        tpl += columnTpl;
      }
      tpl +=
        '     </div>\n\
            </div>\n\
          </div>\n\
        </div>\n';
      return tpl;
    }

    function getGridTemplate(columns) {
      var headerCells = '';
      var valueCells = '';
      var template =
        '<div class="row">\n\
          <div class="col-md-6 col-sm-12">\n\
            <div class="dataTables_length" id="sample_1_length">\n\
              <label>\n\
                <select ng-model="pager.pageSize" ng-change="pager.pageChanged()" class="form-control input-xsmall input-inline"\n\>\n\
                  <option value="5">5</option>\n\
                  <option value="15">15</option>\n\
                  <option value="20">20</option>\n\
                  <option value="-1">Todos</option>\n\
                </select> Registros\n\
              </label>\n\
            </div>\n\
          </div>\n\
          <div class="col-md-6 col-sm-12">\n\
            <div id="sample_1_filter" class="dataTables_filter">\n\
              <label>\n\
                Buscar:\n\
                <input type="search" class="form-control input-inline input-large" placeholder="" aria-controls="sample_1">\n\
              </label>\n\
            </div>\n\
          </div>\n\
        </div>\n\
        <table class="table table-condensed table-striped table-bordered table-hover">\n\
          <thead>\n\
            <tr>\n\
              [header-cells]\
              <th width="150px"></th>\n\
            </tr>\n\
          </thead>\n\
          <tbody>\n\
            <tr ng-repeat="item in items" class="odd gradeX">\n\
              [value-cells]\
              <td>\n\
                <a ng-click="view(item)" class="btn btn-xs btn-primary"><i class="fa fa-check-square-o"></i></a>\n\
                <a ng-click="edit(item)" class="btn btn-xs btn-warning"><i class="fa fa-edit"></i></a>\n\
                <a ng-click="delete($index)" class="btn  btn-xs btn-danger"><i class="fa fa-trash-o"></i></a>\n\
              </td>\n\
            </tr>\n\
          </tbody>\n\
        </table>\n\
        <div class="row">\n\
          <div class="col-md-5 col-sm-12">\n\
            <div class="dataTables_info" id="sample_2_info" role="status" aria-live="polite">{{getPagerStatus()}}</div>\n\
          </div>\n\
          <div class="col-md-7 col-sm-12">\n\
            <div class="dataTables_paginate paging_simple_numbers">\n\
              <pagination boundary-links="true" total-items="pager.totalItems" items-per-page="pager.pageSize" \
              ng-change="pager.pageChanged()" ng-model="pager.page" previous-text="&lsaquo;" next-text="&rsaquo;" first-text="&laquo;" \
              last-text="&raquo;"></pagination>\n\
            </div>\n\
          </div>\n\
        </div>\n';

      var filteredColumns = _.sortBy(_.where(columns, {visible: true}), function (item) {
        return item.position || 9999999;
      });
      var i;
      for (i = 0; i < filteredColumns.length; i++) {
        var col = filteredColumns[i];
        headerCells += '<th>\n' + col.title + '</th>\n';
        if(col.type === 'selection' || col.type === 'foreign-key'){
        valueCells += '<td>{{getOptionsAttribute(item.'+ col.name + ', ' + col.options +', ' + col.value + ', ' + col.text + ')}}</td>\n';
      }else if(col.type === 'date'){
      valueCells += '<td>{{item.' + col.name + ' | date:\'dd/MM/yyyy\'}}</td>\n';
      }else{
        valueCells += '<td>{{item.' + col.name + '}}</td>\n';
      }
      }
      return template.replace(/\[header-cells]/g, headerCells).replace(/\[value-cells]/, valueCells);
    }

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
        onClickEdit: '&',
        onClickDelete: '&',
        onClickShow: '&',
        onClickNew: '&',
        gridTemplate: '@gridTemplate',
        detailsTemplate: '@detailsTemplate',
        editTemplate: '@editTemplate'
      },
      restrict: 'E',
      replace: true,
      link: function (scope, element, attrs) {
        scope.$watch('columns', function(newVal, oldVal){
          if(newVal && newVal.length > 0 && newVal !== oldVal){
            var listHtml = getGridTemplate(scope.columns);
            console.log(listHtml);
            console.log('========================================');
            console.log('columnas en link', scope.columns);
            var detailsHtml = getEditTemplate(scope.columns);
            console.log(detailsHtml);
            element.html(listHtml).show();
            $compile(element.contents())(scope);
            scope.get();
          }
        });

        scope.isFunction = function (func) {
          return angular.isDefined(attrs[func]) && isFunction(scope[func]);
        };
      }
      //template: '<ng-include src="gridTemplate"></ng-include>\n',
      //controller: 'gtsCrudListController'
    };
  }])
  .controller('gtsCrudListController',
  ['$scope', '$modal', 'ApiClient', function ($scope, $modal, ApiClient) {
    $scope.items = $scope.items || [];
    $scope.gridTemplate = $scope.gridTemplate || 'nggts/directives/gts-crud/gts-crud-list.html';
    $scope.pager = {page: $scope.currentPage || 1, pageSize: $scope.pageSize};

    $scope.getKey = function(index) {
      var result;
      if(!$scope.keyAttribute){
        console.error('Se debe definir el atributo llave en el scope, $scope.keyAttribute = \'nombre-atributo-clave\';');
      }else {
        if($scope.items && $scope.items[index]){
          result = $scope.items[index][$scope.keyAttribute];
        }
      }
      return result;
    };

    $scope.getOptionsAttribute = function(value, options, valueAttribute, textAttribute) {
      var found = false;
      var result = '';
      var i = 0;
      console.log('+++++++++++++++++++++++++++++++++++++++++++', value, options, valueAttribute, textAttribute);
      if (!options) {
        return result;
      }
      //var columns = options;
      while (!found && i < options.length) {
        var item = options[i];
        if (item[valueAttribute] === value) {
          found = true;
          result = item[textAttribute];
        }
        i++;
      }
      return result;
    };

    // $scope.getItemValue = function (item, col) {
    //   if (col.type === 'foreign-key' || col.type === 'selection') {
    //     return getOptionsAttribute(item[col.name], col.options, col.value, col.text);
    //   } else if (col.type === 'date') {
    //     return item[col.name];
    //   }
    //   else {
    //     return item[col.name];
    //   }
    // };

    $scope.get = function () {
      if ($scope.serviceUrl) {
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
      } else {
        if ($scope.items) {
          if (!$scope.originalItems) {
            $scope.originalItems = $scope.items;
          }
          $scope.pager.totalItems = $scope.originalItems.length;
          $scope.items = $scope.originalItems.slice(($scope.pager.page - 1) * $scope.pager.pageSize,
            $scope.pager.pageSize);
          //console.log(result);
          //console.log($scope.items);
        }
      }
    };

    $scope.getPagerStatus = function () {
      var result = 'Mostrando ' + (($scope.pager.pageSize * $scope.pager.page - $scope.pager.pageSize) + 1) + ' al ';
      if (($scope.pager.pageSize * $scope.pager.page) <= $scope.pager.totalItems) {
        result += ($scope.pager.pageSize * $scope.pager.page);
      }
      else {
        result += $scope.pager.totalItems;
      }
      result += ' de ' + $scope.pager.totalItems + ' registros';
      return result;
    };

    $scope.pager.pageChanged = function () {
      //console.log($scope.pager.pag);
      $scope.get();
    };

    $scope.delete = function (index) {
      if (!$scope.serviceUrl) {
        $scope.items.slice(index);
      } else {
        var key =  $scope.getKey(index);
        if(key){
          ApiClient.delete($scope.serviceUrl, key).then(function (result) {
            if (result.code !== 0) {
              //no se pudo borrar
              //$scope.showAlert(result.description, 'danger');
              console.log(result);
            } else {
              //se borro con exito
              //$scope.showAlert(result.description, 'success');
              $scope.items.splice(index, 1);
            }
          }, function (result) {
            $scope.showAlert('Ocurrió un error, por favor intenta nuevamente', 'danger');
            console.log(result);
          });
        }
      }
    };

    //$scope.get();

    $scope.edit = function (item) {
      if (typeof $scope.onClickEdit === 'function') {
        $scope.onClickEdit()(item);
      } else {
        $scope.openModal('edit', item);
      }
    };

    $scope.new = function () {
      if (typeof $scope.onClickNew === 'function') {
        $scope.onClickNew()();
      } else {
        $scope.openModal('new');
      }
    };

    $scope.view = function (item) {
      if (typeof $scope.onClickShow === 'function') {
        $scope.onClickShow()(item);
      } else {
        $scope.openModal('view', item);
      }
    };

    $scope.openModal = function (action, item) {
      if (action === 'new') {
        item = {};
        $scope.items.push(item);
      }

      $scope.selectedItem = item;
      var modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: $scope.detailsTemplate || 'nggts/directives/gts-crud/gts-crud-details.html',
        size: 'lg',
        controller: 'gtsCrudDetailsController',
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
        console.log('Modal closed', result, $scope.selectedItem);
      }, function (reason) {
        console.log('Modal dismissed at: ' + reason);
      });
    };
  }])
  .controller('gtsCrudDetailsController',
  ['$scope', '$modalInstance', 'ApiClient', 'model',
    function ($scope, $modalInstance, ApiClient, model) {
      $scope.model = model;
      $scope.alert = {};

      $scope.isEditable = function (value) {
        //console.log(value);
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
          $scope.showAlert('Ocurrió un error, por favor intenta nuevamente ', 'danger');
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
        if (!$scope.model.serviceUrl) {
          $scope.showAlert('Se agrego el elemento con exito', 'success');
        } else {
          var key = getKey();
          if (key != null) {
            update();
          } else {
            create();
          }
        }
      };

      $scope.ok = function () {
        $modalInstance.close($scope.model.data);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

      $scope.showAlert = function (msg, type) {
        $scope.alert.show = true;
        $scope.alert.msg = msg;
        $scope.alert.type = type;
      };

      $scope.closeAlert = function () {
        $scope.alert.show = false;
        $scope.alert.msg = '';
        $scope.alert.type = '';
      };
    }
  ]);

/**
 * Created by MaGo on 04/09/2015.
 */
'use strict';
angular.module('nggts.directives').directive('gtsDatePicker', ['$timeout', '$http', '$templateCache', '$compile',
  function ($timeout, $http, $templateCache, $compile) {
    return {
      restrict: 'EA',
      replace: true,
      link: function(scope, element, attrs) {
        var dataTemplate = attrs.template;
        var modelAttr = attrs.ngModel;
        var picker = null;
        //console.log('.................',attrs);
        var pickerTemplate = 'nggts/directives/gts-date-picker/gts-date-picker-default.html';
        if (dataTemplate === 'form-group') {
          pickerTemplate = 'nggts/directives/gts-date-picker/gts-date-picker-form-group.html';
        }
        $http.get(pickerTemplate, { cache: $templateCache }).success(function (tplContent) {
          tplContent = tplContent.replace('[data-model]', modelAttr);
          var el = $compile(tplContent)(scope);
          if ($().datepicker) {
            picker = el.datepicker(
              attrs
            );
            if (scope[modelAttr]) {
              picker.datepicker('setDate', scope[modelAttr]);
            }
            picker.on('changeDate', function (e) {
              scope[modelAttr] = e.date;
              scope.$apply();
            });
          }
          element.replaceWith(el);
        });
        scope.$watch(modelAttr, function (newVal, oldVal) {
          if (picker && newVal !== oldVal) {
            picker.datepicker('update',newVal);
          }
        });
      }
    };
  }
]);

angular.module("nggts.templates").run(["$templateCache", function($templateCache) {$templateCache.put("nggts/directives/gts-crud/gts-crud-details-list.html","<div class=\"portlet light\"><div class=portlet-title><div class=caption><span class=\"caption-subject font-blue-steel bold uppercase\">{{title}}</span> <span class=caption-helper>listado</span></div><div class=actions><a href ng-click=\"open(\'new\')\" class=\"btn btn-circle btn-default btn-sm\"><i class=\"fa fa-plus\"></i> Agregar</a></div></div><div class=portlet-body><table class=\"table table-condensed table-striped table-bordered table-hover\" id=sample_2><thead><tr><th ng-repeat=\"col in columns | filter:{visible : true} | orderBy:\'position||9999\'\">{{col.title}}</th><th width=150px></th></tr></thead><tbody><tr ng-repeat=\"item in items\" class=\"odd gradeX\"><td ng-repeat=\"col in columns | filter:{visible : true} | orderBy:\'position||9999\'\">{{getItemValue(item, col)}}</td><td><a ng-click=\"open(\'view\', item)\" class=\"btn btn-xs btn-primary\"><i class=\"fa fa-check-square-o\"></i></a> <a ng-click=\"open(\'edit\', item)\" class=\"btn btn-xs btn-warning\"><i class=\"fa fa-edit\"></i></a> <a ng-click=delete(item) class=\"btn btn-xs btn-danger\"><i class=\"fa fa-trash-o\"></i></a></td></tr></tbody></table><div class=row><div class=\"col-md-5 col-sm-12\"><div class=dataTables_info id=sample_2_info role=status aria-live=polite>{{getPagerStatus()}}</div></div><div class=\"col-md-7 col-sm-12\"><div class=\"dataTables_paginate paging_simple_numbers\"><pagination boundary-links=true total-items=pager.totalItems items-per-page=pager.pageSize ng-change=pager.pageChanged() ng-model=pager.page previous-text=&lsaquo; next-text=&rsaquo; first-text=&laquo; last-text=&raquo;></pagination></div></div></div></div></div>");
$templateCache.put("nggts/directives/gts-crud/gts-crud-details.html","<div class=modal-header><button ng-click=\"$dismiss(\'exit\')\" type=button class=close data-dismiss=modal aria-hidden=true></button><div class=\"caption font-blue\"><i class=\"icon-settings font-blue\"></i> <span class=\"caption-subject bold uppercase\">{{model.title}} - {{model.action}}</span></div></div><div class=modal-body><div class=row><div class=\"col col-md-12 form\"><div role=form class=form-horizontal><div class=form-body><div ng-repeat=\"col in model.columns | filter:showColumn | orderBy:\'position||9999\'\"><div class=\"form-group form-md-floating-label\" ng-class=\"{\'form-md-line-input\' : col.type != \'selection\' && col.type != \'multi-selection\', \'form-md-dropdown-input\' : col.type == \'selection\' || col.type == \'multi-selection\'}\"><label ng-if=\"col.type !== \'details\'\" class=\"col-md-2 control-label\" for=\"{{\'form_control_\'+col.name}}\">{{col.title}}</label><div ng-if=\"col.type == \'text\'\" class=col-md-10><input type=text ng-model=model.data[col.name] ng-disabled=!isEditable(col.editable) tabindex={{col.position}} class=form-control id=\"{{\'form_control_\'+col.name}}\" placeholder=\"Ingresar {{col.title}}\"><div class=form-control-focus></div></div><div ng-if=\"col.type == \'date\'\" class=col-md-10><gts-date-picker data-autoclose=true data-language=es data-today-highlight=true data-date-format=dd-mm-yyyy data-date-start-date=+0d ng-model=model.data[col.name] ng-disabled=!isEditable(col.editable) tabindex={{col.position}} class=success data-template=default></gts-date-picker><div class=form-control-focus></div></div><div ng-if=\"col.type == \'password\'\" class=col-md-10><input type=password ng-model=model.data[col.name] ng-disabled=!isEditable(col.editable) tabindex={{col.position}} class=form-control id=\"{{\'form_control_\'+col.name}}\" placeholder=\"Ingresar {{col.title}}\"><div class=form-control-focus></div></div><div ng-if=\"col.type == \'boolean\'\" class=col-md-10><input type=text ng-model=model.data[col.name] ng-disabled=!isEditable(col.editable) tabindex={{col.position}} class=form-control id=\"{{\'form_control_\'+col.name}}\" placeholder=\"Ingresar {{col.title}}\"><div class=form-control-focus></div></div><div ng-if=\"col.type == \'foreign-key\'\" class=col-md-10 tabindex={{col.position}}><input type=text ng-model=model.data[col.name] ng-disabled=!isEditable(col.editable) typeahead=\"item[col.value] as item[col.text] for item in col.options | filter:$viewValue | limitTo:8\" typeahead-input-formatter=\"formatLabel($model, col.options, col.value, col.text)\" class=form-control id=\"{{\'form_control_\'+col.name}}\" placeholder=\"Ingresar {{col.title}}\"><div class=form-control-focus></div></div><div ng-if=\"col.type == \'selection\'\" class=col-md-10><ui-select ng-model=model.data[col.name] theme=bootstrap ng-disabled=!isEditable(col.editable)><ui-select-match placeholder=\"Ingrese texto para buscar...\">{{$select.selected[col.text]}}</ui-select-match><ui-select-choices repeat=\"item[col.value] as item in col.options | filter: $select.search\"><div ng-bind-html=\"item[col.text] | highlight: $select.search\"></div></ui-select-choices></ui-select></div><div ng-if=\"col.type == \'multi-selection\'\" class=col-md-10><ui-select multiple ng-model=model.data[col.name] theme=bootstrap close-on-select=false ng-disabled=!isEditable(col.editable)><ui-select-match placeholder=\"Ingrese texto para buscar...\">{{$item[col.text]}}</ui-select-match><ui-select-choices repeat=\"item[col.value] as item in col.options | filter: $select.search\"><div ng-bind-html=\"item[col.text] | highlight: $select.search\"></div></ui-select-choices></ui-select></div><div ng-if=\"col.type == \'details\'\" class=col-md-12><gts-crud grid-template=nggts/directives/gts-crud/gts-crud-details-list.html title={{col.title}} columns=col.columns items=model.data[col.name] icon=\"fa fa-users\" page-size=5></gts-crud></div></div></div><alert ng-show=alert.show type={{alert.type}} close=closeAlert()>{{alert.msg}}</alert></div></div></div></div><div class=row></div></div><div class=modal-footer><button ng-click=cancel() type=button data-dismiss=modal class=\"btn btn-default\">Cerrar</button> <button ng-click=save() ng-if=\"isEditable(\'$form\')\" type=button class=\"btn btn-primary\">Guardar</button></div>");
$templateCache.put("nggts/directives/gts-crud/gts-crud-list.html","<div class=\"portlet box blue\"><div class=portlet-title><div class=caption><i class={{icon}}></i>{{title}} - Listado</div><div class=actions><a href ng-click=\"open(\'new\')\" class=\"btn btn-default btn-sm\"><i class=\"fa fa-pencil\"></i> Agregar</a><div class=btn-group><a class=\"btn btn-default btn-sm\" href=javascript:; data-toggle=dropdown><i class=\"fa fa-cogs\"></i> Operaciones <i class=\"fa fa-angle-down\"></i></a><ul class=\"dropdown-menu pull-right\"><li><a href=javascript:;><i class=\"fa fa-pencil\"></i> Editar</a></li><li><a href=javascript:;><i class=\"fa fa-trash-o\"></i> Borrar</a></li><li><a href=javascript:;><i class=\"fa fa-ban\"></i> Bloquear</a></li></ul></div></div></div><div class=portlet-body><div class=row><div class=\"col-md-6 col-sm-12\"><div class=dataTables_length id=sample_1_length><label><select ng-model=pager.pageSize ng-change=pager.pageChanged() name=sample_1_length aria-controls=sample_1 class=\"form-control input-xsmall input-inline\"><option value=5>5</option><option value=15>15</option><option value=20>20</option><option value=-1>Todos</option></select>Registros</label></div></div><div class=\"col-md-6 col-sm-12\"><div id=sample_1_filter class=dataTables_filter><label>Buscar: <input type=search class=\"form-control input-inline input-large\" placeholder aria-controls=sample_1></label></div></div></div><table class=\"table table-condensed table-striped table-bordered table-hover\" id=sample_2><thead><tr><th ng-repeat=\"col in columns | filter:{visible : true} | orderBy:\'position||9999\'\">{{col.title}}</th><th width=150px></th></tr></thead><tbody><tr ng-repeat=\"item in items\" class=\"odd gradeX\"><td ng-repeat=\"col in columns | filter:{visible : true} | orderBy:\'position||9999\'\">{{getItemValue(item, col)}}</td><td><a ng-click=\"open(\'view\', item)\" class=\"btn btn-xs btn-primary\"><i class=\"fa fa-check-square-o\"></i></a> <a ng-click=\"open(\'edit\', item)\" class=\"btn btn-xs btn-warning\"><i class=\"fa fa-edit\"></i></a> <a ng-click=delete(item) class=\"btn btn-xs btn-danger\"><i class=\"fa fa-trash-o\"></i></a></td></tr></tbody></table><div class=row><div class=\"col-md-5 col-sm-12\"><div class=dataTables_info id=sample_2_info role=status aria-live=polite>{{getPagerStatus()}}</div></div><div class=\"col-md-7 col-sm-12\"><div class=\"dataTables_paginate paging_simple_numbers\"><pagination boundary-links=true total-items=pager.totalItems items-per-page=pager.pageSize ng-change=pager.pageChanged() ng-model=pager.page previous-text=&lsaquo; next-text=&rsaquo; first-text=&laquo; last-text=&raquo;></pagination></div></div></div></div></div>");
$templateCache.put("nggts/directives/gts-date-picker/gts-date-picker-default.html","<input class=\"form-control form-control-inline input-medium date-picker\" size=16 type=text ng-model=[data-model] value>");
$templateCache.put("nggts/directives/gts-date-picker/gts-date-picker-form-group.html","<div class=\"input-group input-medium date date-picker\"><input type=text ng-model=[data-model] class=form-control readonly> <span class=input-group-btn><button class=\"btn default\" type=button><i class=\"fa fa-calendar\"></i></button></span></div>");
$templateCache.put("nggts/directives/gts-crud/gts-selection-modal/gts-selection-modal.html","<!DOCTYPE html><html lang=en><head><meta charset=UTF-8><title></title></head><body></body></html>");}]);