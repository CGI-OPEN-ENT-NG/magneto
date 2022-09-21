import {ng, toasts} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {boardsService} from "../../services";
import {AxiosResponse} from "axios";

interface IViewModel extends ng.IController, IBoardDeleteProps {
    submitDeleteBoard?(): Promise<void>;

    closeForm(): void;
}

interface IBoardDeleteProps {
    onSubmit?;
    display: boolean;
    isPredelete: boolean;
    boardIds: Array<string>;
}

interface IBoardDeleteScope extends IScope, IBoardDeleteProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    isPredelete: boolean;
    boardIds: Array<string>;

    constructor(private $scope: IBoardDeleteScope,
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
        templateUrl: `${RootsConst.directive}board-delete-lightbox/board-delete-lightbox.html`,
        scope: {
            display: '=',
            onSubmit: '&',
            isPredelete: '=',
            boardIds: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardDeleteScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitDeleteBoard = async (): Promise<void> => {
                try {
                    if (vm.isPredelete) {
                        boardsService.preDeleteBoards(vm.boardIds)
                            .then((response: AxiosResponse) => {
                                    if (response.status === 200 || response.status === 201) {
                                        toasts.confirm((vm.boardIds.length > 1) ?
                                            'magneto.predelete.boards.confirm' : 'magneto.predelete.board.confirm');
                                        $parse($scope.vm.onSubmit())({});
                                        vm.closeForm();
                                    } else {
                                        toasts.warning((vm.boardIds.length > 1) ?
                                            'magneto.predelete.boards.error' : 'magneto.predelete.board.error');
                                    }
                                }
                            );
                    } else {
                        boardsService.deleteBoards(vm.boardIds)
                            .then((response: AxiosResponse) => {
                                if (response.status === 200 || response.status === 201) {
                                    toasts.confirm((vm.boardIds.length > 1) ?
                                        'magneto.delete.boards.confirm' : 'magneto.delete.board.confirm');
                                    $parse($scope.vm.onSubmit())({});
                                    vm.closeForm();
                                } else {
                                    toasts.warning((vm.boardIds.length > 1) ?
                                        'magneto.delete.boards.error' : 'magneto.delete.board.error');
                                }
                            });
                    }

                } catch (e) {
                    throw e;
                }
            }
        }
    }
}

export const boardDeleteLightbox = ng.directive('boardDeleteLightbox', directive)