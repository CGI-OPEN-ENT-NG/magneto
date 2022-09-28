import {ng} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {foldersService} from "../../services";
import {Folder} from "../../models";
import {FOLDER_TYPE} from "../../core/enums/folder-type.enum";

interface IViewModel extends ng.IController, IFolderManageProps {
    submitFolder?(): Promise<void>;

    isFormValid(): boolean;

    closeForm(): void;
}

interface IFolderManageProps {
    display: boolean;
    isUpdate: boolean;
    form: Folder;
    parentId: string;
    onSubmit?;
}

interface IFolderManageScope extends IScope, IFolderManageProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    isUpdate: boolean;
    form: Folder;
    parentId: string;


    constructor(private $scope: IFolderManageScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
    }

    isFormValid = (): boolean => {
        return this.form.title && this.form.title.length > 0;
    }

    closeForm = (): void => {
        this.display = false;
        this.form.title = '';
        this.isUpdate = false;
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
            isUpdate: '=',
            parentId: '=',
            onSubmit: '&',
            form: '='
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
                    if (vm.isUpdate) {
                        await foldersService.updateFolder(vm.form.id, vm.form.title);
                    } else {
                        await foldersService.createFolder(vm.form.title,
                            (vm.parentId === FOLDER_TYPE.MY_BOARDS
                                || vm.parentId === FOLDER_TYPE.DELETED_BOARDS) ? null : vm.parentId);
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

export const folderManageLightbox = ng.directive('folderManageLightbox', directive)