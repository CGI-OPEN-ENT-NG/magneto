import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";

interface IViewModel extends ng.IController, IBoardSearchBarProps {
    searchBoard?(): void;
}

interface IBoardSearchBarProps {
    searchText: string;
    onSearch?;
}

interface IBoardSearchBarScope extends IScope, IBoardSearchBarProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    searchText: string;

    constructor(private $scope: IBoardSearchBarScope,
                private $location: ILocationService,
                private $window: IWindowService,
                private $parse: IParseService) {
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
        templateUrl: `${RootsConst.directive}/board-search-bar/board-search-bar.html`,
        scope: {
            searchText: '=',
            onSearch: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardSearchBarScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.searchBoard = (): void => {
                $parse($scope.vm.onSearch())(vm.searchText)
            }
        }
    }
}

export const boardSearchBar = ng.directive('boardSearchBar', directive)