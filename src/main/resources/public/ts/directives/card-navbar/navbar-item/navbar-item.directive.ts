import {ng} from "entcore";
import {RootsConst} from "../../../core/constants/roots.const";
import {ILocationService, IScope, IWindowService} from "angular";

interface IViewModel {

    label: string;
    isSelected: boolean;
}

interface INavbarItemScope extends IScope {
    vm: IViewModel;
}

class Controller implements ng.IController, IViewModel {
    label: string;
    isSelected: boolean;

    constructor(private $scope: INavbarItemScope) {
    }


    $onInit() {
    }

    $onDestroy() {
    }


}

function directive() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}/card-navbar/navbar-item/navbar-item.html`,
        scope: {
            label: '=',
            isSelected: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', Controller],
        /* interaction DOM/element */
        link: function ($scope: INavbarItemScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: ng.IController) {
        }
    }
}

export const navbarItem = ng.directive('navbarItem', directive)