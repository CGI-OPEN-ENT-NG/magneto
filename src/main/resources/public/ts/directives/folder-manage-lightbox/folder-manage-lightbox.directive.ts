import {ng} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {foldersService} from "../../services";

interface IViewModel extends ng.IController, IFolderManageProps {
    title: string;

    submitFolder?(): Promise<void>;

    isFormValid(): boolean;

    closeForm(): void;
}

interface IFolderManageProps {
    display: boolean;
    parentId: string;
    onSubmit?;
}

interface IFolderManageScope extends IScope, IFolderManageProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    parentId: string;
    title: string;
    onSubmit: () => void;


    constructor(private $scope: IFolderManageScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
        this.title = '';
    }

    isFormValid = (): boolean => {
        return this.title && this.title.length > 0;
    }

    closeForm = (): void => {
        this.display = false;
        this.title = '';
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}folder-manage-lightbox/folder-manage-lightbox.html`,
        scope: {
            display: '=',
            parentId: '=',
            onSubmit: '&',
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IFolderManageScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitFolder = async (): Promise<void> => {
                try {
                    await foldersService.createFolder(vm.title, vm.parentId);
                } catch (e) {
                    throw e;
                }

                $parse($scope.vm.onSubmit())({});

                vm.closeForm();
            };
        }
    }
}

export const folderManageLightbox = ng.directive('folderManageLightbox', directive)