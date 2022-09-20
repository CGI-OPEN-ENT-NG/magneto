import {ng} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {boardsService, IBoardsService} from "../../services";
import {Board, BoardForm} from "../../models/board.model";

interface IViewModel extends ng.IController, IBoardManageProps {
    submitBoard?(): Promise<void>;

    isFormValid(): boolean;

    closeForm(): void;
}

interface IBoardManageProps {
    display: boolean;
    isUpdate: boolean;
    boardToUpdate: Board;
    form: BoardForm;
    onSubmit?;
}

interface IBoardManageScope extends IScope, IBoardManageProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    isUpdate: boolean;
    boardToUpdate: Board;
    form: BoardForm;
    onSubmit: () => void;


    constructor(private $scope: IBoardManageScope,
                private $location: ILocationService,
                private $window: IWindowService,
                private boardsService: IBoardsService) {
    }

    $onInit() {
    }

    isFormValid = (): boolean => {
        return this.form.isValid();
    }

    closeForm = (): void => {
        this.display = false;
        this.isUpdate = false;
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}board-manage-lightbox/board-manage-lightbox.html`,
        scope: {
            display: '=',
            isUpdate: '=',
            onSubmit: '&',
            form: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', 'BoardsService', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardManageScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitBoard = async (): Promise<void> => {
                try {
                    let form : BoardForm = new BoardForm();
                    form.title = vm.form.title;
                    form.description = vm.form.description;
                    form.imageUrl = vm.form.imageUrl;

                    if (vm.isUpdate) {
                        await boardsService.updateBoard(vm.form.id, form);
                    } else {
                        await boardsService.createBoard(form);
                    }

                } catch (e) {
                    throw e;
                }

                $parse($scope.vm.onSubmit())({});

                vm.closeForm();
            };
        }
    }
}

export const boardManageLightbox = ng.directive('boardManageLightbox', directive)