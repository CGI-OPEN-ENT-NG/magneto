import {ng} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";

interface IViewModel extends ng.IController, IFolderManageProps {
    selectedFile: Document;
    closeForm(): void;
    updateDocument?(): void;
}

interface IFolderManageProps {
    fileFormat: string;
    onSubmit?;
}

interface IFolderManageScope extends IScope, IFolderManageProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    fileFormat: string;
    selectedFile: Document;

    constructor(private $scope: IFolderManageScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
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
        templateUrl: `${RootsConst.directive}media-library-lightbox/media-library-lightbox.html`,
        scope: {
            display: '=',
            onSubmit: '&',
            fileFormat: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IFolderManageScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
            vm.updateDocument = (): void => {
                $parse($scope.vm.onSubmit())(vm.selectedFile);
                vm.display = false;
            }
        }
    }
}

export const mediaLibraryLightbox = ng.directive('mediaLibraryLightbox', directive)