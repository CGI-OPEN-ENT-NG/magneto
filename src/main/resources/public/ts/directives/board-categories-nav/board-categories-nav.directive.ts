import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {safeApply} from "../../utils/safe-apply.utils";

interface IViewModel extends ng.IController, IBoardCategoriesNavProps {
    isPublic: boolean;
    isTrash: boolean;
    isMyBoards: boolean;

    switchToPublic?(): Promise<void>;
    switchToTrash?(): Promise<void>;
    switchToMyBoards?(): Promise<void>;
    sendCategories?(): void;
}

interface IBoardCategoriesNavProps {
    onCategorySwitch?;
}

interface IBoardCategoriesNavScope extends IScope, IBoardCategoriesNavProps {
    vm: IViewModel;
}

class Controller implements IViewModel {
    isPublic: boolean;
    isTrash: boolean;
    isMyBoards: boolean;

    constructor(private $scope: IBoardCategoriesNavScope,
                private $location: ILocationService,
                private $window: IWindowService,
                private $parse: IParseService) {
    }

    $onInit(): void {
        this.isPublic = false;
        this.isTrash = false;
        this.isMyBoards = true;
        safeApply(this.$scope);
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}/board-categories-nav/board-categories-nav.html`,
        scope: {
            onCategorySwitch: "&"
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardCategoriesNavScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.switchToPublic = async (): Promise<void> => {
                if (!vm.isPublic) {
                    vm.isPublic = true;
                    vm.isTrash = false;
                    vm.isMyBoards = false;
                    safeApply($scope);
                    $scope.vm.sendCategories();
                }
            }

            vm.switchToTrash = async (): Promise<void> => {
                if (!vm.isTrash) {
                    vm.isPublic = false;
                    vm.isTrash = true;
                    vm.isMyBoards = false;
                    safeApply($scope);
                    $scope.vm.sendCategories();
                }
            }

            vm.switchToMyBoards = async (): Promise<void> => {
                if (!vm.isMyBoards) {
                    vm.isPublic = false;
                    vm.isTrash = false;
                    vm.isMyBoards = true;
                    safeApply($scope);
                    $scope.vm.sendCategories();
                }
            }

            vm.sendCategories = (): void => {
                $parse($scope.vm.onCategorySwitch())({
                    isPublic: vm.isPublic,
                    isTrash: vm.isTrash
                });
            }
        }
    }
}

export const boardCategoriesNav = ng.directive('boardCategoriesNav', directive)