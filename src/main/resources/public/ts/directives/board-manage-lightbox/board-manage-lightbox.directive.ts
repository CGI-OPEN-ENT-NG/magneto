import {ng} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {boardsService, IBoardsService} from "../../services";

interface IViewModel extends ng.IController, IBoardManageProps {
    submitCreateBoard?(): Promise<void>;

    isFormValid(): boolean;

    closeForm(): void;
}

interface IBoardManageProps {
    display: boolean;
    form: {
        title: string,
        description: string,
        imageUrl: string
    };
    onSubmit?;
}

interface IBoardManageScope extends IScope, IBoardManageProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    form: {
        title: string,
        description: string,
        imageUrl: string
    }


    constructor(private $scope: IBoardManageScope,
                private $location: ILocationService,
                private $window: IWindowService,
                private boardsService: IBoardsService) {
    }

    $onInit() {
        this.display = false;
        this.form = {
            title: '',
            description: '',
            imageUrl: ''
        }
    }

    isFormValid = (): boolean => {
        return this.form.title && this.form.title !== '' &&
            this.form.description && this.form.description !== '' &&
            this.form.imageUrl && this.form.imageUrl !== '';
    }

    closeForm = (): void => {
        this.form = {
            title: '',
            description: '',
            imageUrl: ''
        }
        this.display = false;
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
            onSubmit: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', 'BoardsService', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardManageScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitCreateBoard = async (): Promise<void> => {
                try {
                    await boardsService.createBoard({
                        title: vm.form.title, description: vm.form.description, imageUrl: vm.form.imageUrl});

                } catch (e) {
                    throw e;
                }

                $parse($scope.vm.onSubmit())({});

                vm.closeForm();
            }
        }
    }
}

export const boardManageLightbox = ng.directive('boardManageLightbox', directive)