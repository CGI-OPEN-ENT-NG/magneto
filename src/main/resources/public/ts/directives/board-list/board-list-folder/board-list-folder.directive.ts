import {ng} from "entcore";
import {ILocationService, IScope, IWindowService} from "angular";
import {Folder} from "../../../models";
import {RootsConst} from "../../../core/constants/roots.const";

interface IViewModel extends ng.IController, IBoardListFolderProps {
}

interface IBoardListFolderProps {
    folder: Folder;
    isSelected: boolean;
}

interface IBoardListFolderScope extends IScope, IBoardListFolderProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    folder: Folder;
    isSelected: boolean;

    constructor(private $scope: IBoardListFolderScope,
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
        templateUrl: `${RootsConst.directive}board-list/board-list-folder/board-list-folder.html`,
        scope: {
            folder: '=',
            isSelected: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardListFolderScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
        }
    }
}

export const boardListFolder = ng.directive('boardListFolder', directive)