import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";

interface IViewModel extends ng.IController, IToasterProps {
    open?(): void;
    openProperties?(): void;
    openDelete?(): void;
    openShare?(): void;
    openRestore?(): void;
    openMove?(): void;
    openRename?(): void;
}

interface IToasterProps {
    display: boolean;
    hasOpen: boolean;
    onOpen?;
    hasProperties: boolean;
    onProperties?;
    hasDelete: boolean;
    onDelete?;
    hasShare: boolean;
    onShare?;
    hasRestore: boolean;
    onRestore?;
    hasMove: boolean;
    onMove?;
    hasRename?: boolean;
    onRename?;
}

interface IToasterScope extends IScope, IToasterProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    hasOpen: boolean;
    hasProperties: boolean;
    hasDelete: boolean;
    hasShare: boolean;
    hasRestore: boolean;
    hasMove: boolean;
    hasRename: boolean;

    constructor(private $scope: IToasterScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}/toaster/toaster.html`,
        scope: {
            display: '=',
            hasOpen: '=',
            onOpen: '&',
            hasProperties: '=',
            onProperties: '&',
            hasDelete: '=',
            onDelete: '&',
            hasShare: '=',
            onShare: '&',
            hasRestore: '=',
            onRestore: '&',
            hasMove: '=',
            onMove: '&',
            hasRename: '=',
            onRename: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IToasterScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.open = (): void => {
                $parse($scope.vm.onOpen())({});
            }

            vm.openProperties = (): void => {
                $parse($scope.vm.onProperties())({});
            }

            vm.openDelete = (): void => {
                $parse($scope.vm.onDelete())({});
            }

            vm.openShare = (): void => {
                $parse($scope.vm.onShare())({});
            }

            vm.openRestore = (): void => {
                $parse($scope.vm.onRestore())({});
            }

            vm.openMove = (): void => {
                $parse($scope.vm.onMove())({});
            }

            vm.openRename = (): void => {
                $parse($scope.vm.onRename())({});
            }
        }
    }
}

export const toaster = ng.directive('toaster', directive)