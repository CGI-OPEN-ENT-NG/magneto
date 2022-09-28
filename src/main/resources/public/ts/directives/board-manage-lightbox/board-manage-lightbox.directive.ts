import {ng} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {boardsService} from "../../services";
import {BoardForm} from "../../models";

interface IViewModel extends ng.IController, IBoardManageProps {
    submitBoard?(): Promise<void>;

    isFormValid(): boolean;

    closeForm(): void;
}

interface IBoardManageProps {
    display: boolean;
    isUpdate: boolean;
    form: BoardForm;
    folderId: string;
    onSubmit?;
}

interface IBoardManageScope extends IScope, IBoardManageProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    isUpdate: boolean;
    form: BoardForm;
    folderId: string;
    onSubmit: () => void;


    constructor(private $scope: IBoardManageScope,
                private $location: ILocationService,
                private $window: IWindowService) {
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
            form: '=',
            folderId: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
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
                    form.folderId = vm.folderId;

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