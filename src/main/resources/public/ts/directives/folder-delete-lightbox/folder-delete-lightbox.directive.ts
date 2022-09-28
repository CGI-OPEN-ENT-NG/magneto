import {ng, toasts} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {foldersService} from "../../services";
import {AxiosResponse} from "axios";

interface IViewModel extends ng.IController, IFolderDeleteProps {
    submitDeleteFolder?(): Promise<void>;

    closeForm(): void;
}

interface IFolderDeleteProps {
    onSubmit?;
    display: boolean;
    isPredelete: boolean;
    folderIds: Array<string>;
}

interface IFolderDeleteScope extends IScope, IFolderDeleteProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    isPredelete: boolean;
    folderIds: Array<string>;

    constructor(private $scope: IFolderDeleteScope,
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
        templateUrl: `${RootsConst.directive}folder-delete-lightbox/folder-delete-lightbox.html`,
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
        link: function ($scope: IFolderDeleteScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitDeleteFolder = async (): Promise<void> => {
                try {
                    if (vm.isPredelete) {
                        foldersService.preDeleteFolders(vm.folderIds)
                            .then((response: AxiosResponse) => {
                                    if (response.status === 200 || response.status === 201) {
                                        toasts.confirm('magneto.predelete.folders.confirm');
                                        $parse($scope.vm.onSubmit())({});
                                        vm.closeForm();
                                    } else {
                                        toasts.warning('magneto.predelete.folders.error');
                                    }
                                }
                            );
                    } else {
                        foldersService.preDeleteFolders(vm.folderIds)
                            .then((response: AxiosResponse) => {
                                if (response.status === 200 || response.status === 201) {
                                    toasts.confirm('magneto.delete.folders.confirm');
                                    $parse($scope.vm.onSubmit())({});
                                    vm.closeForm();
                                } else {
                                    toasts.warning('magneto.delete.folders.error');
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

export const folderDeleteLightbox = ng.directive('folderDeleteLightbox', directive)