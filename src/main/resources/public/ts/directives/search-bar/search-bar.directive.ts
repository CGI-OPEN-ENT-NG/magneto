import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";

interface IViewModel extends ng.IController, ISearchBarProps {
    search?(): void;
}

interface ISearchBarProps {
    searchText: string;
    onSearch?;
}

interface ISearchBarScope extends IScope, ISearchBarProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    searchText: string;

    constructor(private $scope: ISearchBarScope,
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
        templateUrl: `${RootsConst.directive}/search-bar/search-bar.html`,
        scope: {
            searchText: '=',
            onSearch: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ISearchBarScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.search = (): void => {
                $parse($scope.vm.onSearch())(vm.searchText)
            }
        }
    }
}

export const searchBar = ng.directive('searchBar', directive)