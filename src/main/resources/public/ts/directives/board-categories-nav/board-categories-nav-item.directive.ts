import {idiom, ng} from "entcore";
import {ILocationService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";

interface IViewModel extends ng.IController, IBoardCategoriesNavItemProps {
    translate(key: string): string;
}

interface IBoardCategoriesNavItemProps {
    title: string;
    iconClass: string;
    hasFolders: boolean;
    isSelected: boolean;
}

interface IBoardCategoriesNavItemScope extends IScope, IBoardCategoriesNavItemProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    title: string;
    iconClass: string;
    hasFolders: boolean;
    isSelected: boolean;

    constructor(private $scope: IBoardCategoriesNavItemScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
    }

    $onDestroy() {
    }

    translate = (key: string): string => idiom.translate(key);

}

function directive() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}/board-categories-nav/board-categories-nav-item.html`,
        scope: {
            title: '=',
            iconClass: '=',
            hasFolders: '=',
            isSelected: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardCategoriesNavItemScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
        }
    }
}

export const boardCategoriesNavItem = ng.directive('boardCategoriesNavItem', directive)