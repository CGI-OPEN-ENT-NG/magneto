import {ng} from "entcore";
import {IScope} from "angular";
import {RootsConst} from "../../core/constants/roots.const";

interface IViewModel {

    typing(): void;

    pausedTyping(): void;

}

interface IDirectiveProperties {
    onSearch(): void;
    searchText: string;

}

interface ISearchBarScope extends IScope {
    vm: IDirectiveProperties;
}

class Controller implements ng.IController, IViewModel {

    searchText: string;
    private token: number;
    private typingTimeout: number;

    constructor(private $scope: ISearchBarScope,
                private $timeout: ng.ITimeoutService) {
    }

    $onInit() {
    }

    $onDestroy() {
    }

    private endTyping = (): void => {
        this.$scope.vm.onSearch();
        cancelAnimationFrame(this.token);
    }

    typing = (): void => {
        clearTimeout(this.typingTimeout);
        cancelAnimationFrame(this.token);
    }

    pausedTyping = (): void => {
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(this.endTyping, 750);
    }

}

function directive() {
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
        controller: ['$scope', '$timeout', Controller],
        /* interaction DOM/element */
        link: function ($scope: ISearchBarScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
        }
    }
}

export const searchBar = ng.directive('searchBar', directive)