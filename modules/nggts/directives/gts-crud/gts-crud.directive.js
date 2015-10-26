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
