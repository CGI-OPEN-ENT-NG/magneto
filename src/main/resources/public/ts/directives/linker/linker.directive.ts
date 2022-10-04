import {ng} from "entcore";
import {ILocationService, IScope, IWindowService, IParseService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";

interface IViewModel extends ng.IController, ILinkerProps {
    form: {url: string, title: string};
    isFormValid(): boolean;
    submitLink?(): void;
    closeForm(): void;
}

interface ILinkerProps {
    display: boolean;

    onSubmit?;
}

interface ILinkerScope extends IScope, ILinkerProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    form: {url: string, title: string};

    constructor(private $scope: ILinkerScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
    }

    isFormValid = (): boolean => {
        return this.form && this.form.url !== '';
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
        templateUrl: `${RootsConst.directive}linker/linker.html`,
        scope: {
            display: '=',
            onSubmit: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ILinkerScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitLink = (): void => {
                $parse($scope.vm.onSubmit())(vm.form);
                this.form = {url: "", title: ""};
                vm.display = false;
            }
        }
    }
}

export const linker = ng.directive('linker', directive)