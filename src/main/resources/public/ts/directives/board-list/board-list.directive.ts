import {ng} from "entcore";
import {ILocationService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board, BoardForm} from "../../models/board.model";

interface IViewModel extends ng.IController, IBoardListProps {
    selectBoard(boardId: string): void;
    isBoardSelected(boardId: string): boolean;
}

interface IBoardListProps {
    boards: Array<Board>;
    selectedBoardIds: Array<string>;
    selectedUpdateBoardForm: BoardForm;
}

interface IBoardListScope extends IScope, IBoardListProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    boards: Array<Board>;
    selectedBoardIds: Array<string>;
    selectedUpdateBoardForm: BoardForm;

    constructor(private $scope: IBoardListScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit = async (): Promise<void> => {
        this.selectedBoardIds = [];
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
        this.selectedUpdateBoardForm.id = selectedUpdateBoard.id;
        this.selectedUpdateBoardForm.title = selectedUpdateBoard.title;
        this.selectedUpdateBoardForm.description = selectedUpdateBoard.description;
        this.selectedUpdateBoardForm.imageUrl = selectedUpdateBoard.imageUrl;
    }

    isBoardSelected = (boardId: string): boolean => {
        return this.selectedBoardIds.find((id: string) => id === boardId) !== undefined;
    }

    $onDestroy() {
    }

}

function directive() {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}board-list/board-list.html`,
        scope: {
            boards: '=',
            selectedBoardIds: '=',
            selectedUpdateBoardForm: '='
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