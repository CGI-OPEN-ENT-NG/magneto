import {ng} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService, IOnChangesObject} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {boardsService} from "../../services";
import {Board, BoardForm} from "../../models";
import {AxiosResponse} from "axios";

interface IViewModel extends ng.IController, IBoardPublishProps {
    submit?(): void;
}

interface IBoardPublishProps {
    onSubmit?: () => any;
    board: Board;
    display: boolean;
}

interface IBoardPublishScope extends IScope, IBoardPublishProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    board: Board;

    constructor(private $scope: IBoardPublishScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
        this.display = false;
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
        templateUrl: `${RootsConst.directive}board-publish-lightbox/board-publish-lightbox.html`,
        scope: {
            display: '=',
            board: '=',
            onSubmit: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardPublishScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {


            vm.submit = async (): Promise<void> => {
                let updateBoard: BoardForm = new BoardForm();
                updateBoard.public = !vm.board.public;
                if (!vm.board.public) {
                    updateBoard.tags = vm.board.tags;
                }
                boardsService.updateBoard($scope.vm.board.id, updateBoard)
                    .then((response: AxiosResponse) => {
                        $parse($scope.vm.onSubmit())({});
                        vm.closeForm();
                    });
            }

        }
    }
}

export const boardPublishLightbox = ng.directive('boardPublishLightbox', directive)