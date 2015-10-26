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
