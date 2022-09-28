import {ng, idiom as lang} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Folder, FolderTreeNavItem} from "../../models";
import {boardsService} from "../../services";
import {FOLDER_TYPE} from "../../core/enums/folder-type.enum";

interface IViewModel extends ng.IController, IBoardMoveProps {
    folderId: string;

    selectFolder(folder: FolderTreeNavItem): void;
    submit?(): Promise<void>;
    isFormValid(): boolean;
    closeForm(): void;
}

interface IBoardMoveProps {
    display: boolean;
    folderTrees: Array<FolderTreeNavItem>;
    boardIds: Array<string>;
    onSubmit?;
}

interface IBoardMoveScope extends IScope, IBoardMoveProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    folders: Array<Folder>;
    folderTrees: Array<FolderTreeNavItem>;
    boardIds: Array<string>;
    folderId: string;
    onSubmit: () => void;


    constructor(private $scope: IBoardMoveScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit(): void {
    }

    isFormValid = (): boolean => {
        return this.folderId !== undefined;
    }

    selectFolder = (folder: FolderTreeNavItem): void => {
        this.folderId = folder.id;
    }



    closeForm = (): void => {
        this.display = false;
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}board-move-lightbox/board-move-lightbox.html`,
        scope: {
            display: '=',
            onSubmit: '&',
            folderTrees: '=',
            boardIds: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardMoveScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submit = async (): Promise<void> => {
                try {
                    if (vm.folderId == FOLDER_TYPE.MY_BOARDS)
                        vm.folderId = null;

                    await boardsService.moveBoardsToFolder(vm.boardIds, vm.folderId);
                } catch (e) {
                    throw e;
                }

                $parse($scope.vm.onSubmit())({});
                vm.closeForm();
            };
        }
    }
}

export const boardMoveLightbox = ng.directive('boardMoveLightbox', directive)