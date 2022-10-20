import {ng} from "entcore";
import {ILocationService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Card} from "../../models";

interface IViewModel extends ng.IController, ICardPreviewProps {
    closeForm(): void;
}

interface ICardPreviewProps {
    display: boolean;
    card: Card;
}

interface ICardPreviewScope extends IScope, ICardPreviewProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    card: Card;


    constructor(private $scope: ICardPreviewScope) {
    }

    $onInit() {
    }

    closeForm = (): void => {
        this.display = false;
    }

    $onDestroy() {
    }

}

function directive() {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-preview-lightbox/card-preview-lightbox.html`,
        scope: {
            display: '=',
            card: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardPreviewScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

        }
    }
}

export const cardPreviewLightbox = ng.directive('cardPreviewLightbox', directive)