import {ng, toasts} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {boardsService, foldersService} from "../../services";
import {AxiosResponse} from "axios";

interface IViewModel extends ng.IController, IBoardDeleteProps {
    submitDelete?(): Promise<void>;

    closeForm(): void;
}

interface IBoardDeleteProps {
    onSubmit?;
    display: boolean;
    isPredelete: boolean;
    boardIds: Array<string>;
    folderIds: Array<string>;
}

interface IBoardDeleteScope extends IScope, IBoardDeleteProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    isPredelete: boolean;
    boardIds: Array<string>;
    folderIds: Array<string>;

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
            boardIds: '=',
            folderIds: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardDeleteScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitDelete = async (): Promise<void> => {
                try {
                    if (vm.isPredelete) {
                        let requests: Array<Promise<AxiosResponse>> = [];
                        if (vm.boardIds.length > 0)
                            requests.push(boardsService.preDeleteBoards(vm.boardIds));
                        if (vm.folderIds.length > 0)
                            requests.push(foldersService.preDeleteFolders(vm.folderIds));
                        Promise.all(requests)
                            .then((response: Array<AxiosResponse>) => {
                                if ((response[0].status === 200 || response[0].status === 201)
                                    && ((response.length > 1) ? (response[1].status === 200 || response[1].status === 201) : true)) {
                                    toasts.confirm('magneto.predelete.elements.confirm');
                                    $parse($scope.vm.onSubmit())({});
                                    vm.closeForm();
                                } else {
                                    toasts.warning('magneto.predelete.elements.error');
                                }
                            });
                    } else {

                        let requests: Array<Promise<AxiosResponse>> = [];
                        if (vm.boardIds.length > 0)
                            requests.push(boardsService.deleteBoards(vm.boardIds));
                        if (vm.folderIds.length > 0)
                            requests.push(foldersService.deleteFolders(vm.folderIds));

                        Promise.all(requests)
                            .then((response: Array<AxiosResponse>) => {
                                if ((response[0].status === 200 || response[0].status === 201)
                                    && ((response.length > 1) ? (response[1].status === 200 || response[1].status === 201) : true)) {
                                    toasts.confirm('magneto.delete.elements.confirm');
                                    $parse($scope.vm.onSubmit())({});
                                    vm.closeForm();
                                } else {
                                    toasts.warning('magneto.delete.elements.error');
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