import {idiom as lang, ng} from "entcore";
import {RootsConst} from "../../core/constants/roots.const";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {COLLECTION_NAVBAR_VIEWS} from "../../core/enums/collection-navbar.enum";

interface IViewModel {
    isSelected(navbarView: COLLECTION_NAVBAR_VIEWS): boolean;
    changeNav?(nav: COLLECTION_NAVBAR_VIEWS): void;
    onNavClick?

    lang: typeof lang;
    NAVBAR_VIEWS: typeof COLLECTION_NAVBAR_VIEWS;
    navbarViewSelected: COLLECTION_NAVBAR_VIEWS;
}

interface ICardNavbarScope extends IScope {
    vm: IViewModel;
}

class Controller implements ng.IController, IViewModel {
    lang: typeof lang;
    NAVBAR_VIEWS: typeof COLLECTION_NAVBAR_VIEWS;
    navbarViewSelected: COLLECTION_NAVBAR_VIEWS;

    constructor(private $scope: ICardNavbarScope,
                private $location: ILocationService,
                private $window: IWindowService) {
        this.NAVBAR_VIEWS = COLLECTION_NAVBAR_VIEWS;
    }

    $onInit() {
        this.lang = lang;
    }

    $onDestroy() {
    }

    isSelected = (navbarView: COLLECTION_NAVBAR_VIEWS): boolean => navbarView === this.navbarViewSelected;


}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}/card-navbar/card-navbar.html`,
        scope: {
            navbarViewSelected: '=',
            onNavClick: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardNavbarScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: ng.IController) {
            vm.changeNav = (nav: COLLECTION_NAVBAR_VIEWS): void => {
                $parse($scope.vm.onNavClick())(nav);
            }
        }
    }
}

export const cardNavbar = ng.directive('cardNavbar', directive)