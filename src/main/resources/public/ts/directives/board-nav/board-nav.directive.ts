import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {RESOURCE_TYPE} from "../../core/enums/resource-type.enum";

interface IViewModel extends ng.IController, IBoardNavProps {
    resourceTypes: typeof RESOURCE_TYPE;

    openCreateCard?(resourceType: RESOURCE_TYPE): void;
    openBoardProperties?(): void;
}

interface IBoardNavProps {
    onCreate?;
}

interface IBoardNavScope extends IScope, IBoardNavProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    resourceTypes: typeof RESOURCE_TYPE;

    constructor(private $scope: IBoardNavScope,
                private $location: ILocationService,
                private $window: IWindowService) {
        this.resourceTypes = RESOURCE_TYPE;
    }

    $onInit = (): void => {
    }


    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}board-nav/board-nav.html`,
        scope: {
            onCreate: '&',
            onProperties: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardNavScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.openCreateCard = (resourceType: RESOURCE_TYPE): void => {
                $parse($scope.vm.onCreate())(resourceType);
            }

            vm.openBoardProperties = (): void => {
                $parse($scope.vm.onProperties())({});
            }
        }
    }
}

export const boardNav = ng.directive('boardNav', directive)