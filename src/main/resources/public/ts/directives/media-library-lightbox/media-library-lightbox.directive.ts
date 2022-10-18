import {ng} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";

interface IViewModel extends ng.IController, IMediaLibraryProps {
    selectedFile: Document;
    closeForm(): void;
    updateDocument?(): void;
}

interface IMediaLibraryProps {
    fileFormat: string;
    onSubmit?;
}

interface IMediaLibraryScope extends IScope, IMediaLibraryProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    fileFormat: string;
    selectedFile: Document;

    constructor(private $scope: IMediaLibraryScope,
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
        link: function ($scope: IMediaLibraryScope,
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