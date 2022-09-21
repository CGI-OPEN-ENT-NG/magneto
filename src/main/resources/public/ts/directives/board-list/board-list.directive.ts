import {ng} from "entcore";
import {ILocationService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board} from "../../models/board.model";

interface IViewModel extends ng.IController, IBoardListProps {
}

interface IBoardListProps {
    boards: Array<Board>;
}

interface IBoardListScope extends IScope, IBoardListProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    boards: Array<Board>;

    constructor(private $scope: IBoardListScope,
                private $location: ILocationService,
                private $window: IWindowService) {
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
        templateUrl: `${RootsConst.directive}board-list/board-list.html`,
        scope: {
            boards: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardListScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
        }
    }
}

export const boardList = ng.directive('boardList', directive)