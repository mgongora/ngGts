angular.module('nggts.directives').directive('gtsCrud', ['$templateCache', function () {
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
      $scope.gridTemplate = $scope.gridTemplate || 'nggts/directives/gts-crud/gts-crud-list.html';
      $scope.pager = { page: $scope.currentPage || 1, pageSize: $scope.pageSize };

      function getKey() {
        var found = false;
        var result = null;
        var i = 0;
        var columns = $scope.columns;
        while (!found && i < columns.length) {
          if (columns[i].type === 'key') {
            found = true;
            result = $scope.items[columns[i].name];
          }
          i++;
        }
        return result;
      }

      function getOptionsAttribute(value, options, valueAttribute, textAttribute) {
        var found = false;
        var result = '';
        var i = 0;
        if(!options){
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
      }

      $scope.getItemValue = function(item, col){
        if(col.type === 'foreign-key' || col.type === 'selection'){
          return getOptionsAttribute(item[col.name], col.options, col.value, col.text);
        }else{
          return item[col.name];
        }
      };

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
            if($scope.items) {
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
          ApiClient.delete($scope.model.serviceUrl, getKey()).then(function (result) {
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
      };

      $scope.get();

      $scope.open = function (action, item) {
        if (action === 'new') {
          item = {};
          $scope.items.push(item);
        }

        $scope.selectedItem = item;
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: $scope.detailsTemplate || 'nggts/directives/gts-crud/gts-crud-details.html',
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
          console.log('Modal closed', result, $scope.selectedItem);
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
