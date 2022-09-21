import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board, BoardForm} from "../../models";
import {Folder} from "../../models";

interface IViewModel extends ng.IController, IBoardListProps {
    selectBoard(boardId: string): void;
    selectFolder(folderId: string): void;
    openFolder?(folderId: string): void;
    isBoardSelected(boardId: string): boolean;
    isFolderSelected(folderId: string);
}

interface IBoardListProps {
    boards: Array<Board>;
    folders: Array<Folder>;
    selectedBoardIds: Array<string>;
    selectedFolderIds: Array<string>;
    selectedUpdateBoardForm: BoardForm;
    onOpen?;
}

interface IBoardListScope extends IScope, IBoardListProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    boards: Array<Board>;
    folders: Array<Folder>;
    selectedBoardIds: Array<string>;
    selectedFolderIds: Array<string>;
    selectedUpdateBoardForm: BoardForm;

    constructor(private $scope: IBoardListScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit = (): void => {
    }

    selectBoard = (boardId: string): void => {
        // select board
        if (!this.isBoardSelected(boardId)) {
            this.selectedBoardIds.push(boardId);
        } else {
            // deselect board
            this.selectedBoardIds = this.selectedBoardIds.filter((id: string) => id !== boardId);
        }

        let selectedUpdateBoard: Board = this.boards.find((board: Board) => board.id === this.selectedBoardIds[0]);
        this.selectedUpdateBoardForm.id = selectedUpdateBoard ? selectedUpdateBoard.id : null;
        this.selectedUpdateBoardForm.title = selectedUpdateBoard ? selectedUpdateBoard.title : '';
        this.selectedUpdateBoardForm.description = selectedUpdateBoard ? selectedUpdateBoard.description : '';
        this.selectedUpdateBoardForm.imageUrl = selectedUpdateBoard ?  selectedUpdateBoard.imageUrl : '';
    }

    selectFolder = (folderId: string): void => {
        // select folder
        if (!this.isFolderSelected(folderId)) {
            this.selectedFolderIds.push(folderId);
        } else {
            // deselect folder
            this.selectedFolderIds = this.selectedFolderIds.filter((id: string) => id !== folderId);
        }
    }

    isBoardSelected = (boardId: string): boolean => {
        return this.selectedBoardIds.find((id: string) => id === boardId) !== undefined;
    }

    isFolderSelected = (folderId: string): boolean => {
        return this.selectedFolderIds.find((id: string) => id === folderId) !== undefined;
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}board-list/board-list.html`,
        scope: {
            boards: '=',
            folders: '=',
            selectedBoardIds: '=',
            selectedFolderIds: '=',
            selectedUpdateBoardForm: '=',
            onOpen: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardListScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.openFolder = (folderId: string): void => {
                $scope.vm.selectFolder(folderId);
                $parse($scope.vm.onOpen())({});
            }
        }
    }
}

export const boardList = ng.directive('boardList', directive)