import {ng, toasts} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {cardsService, foldersService} from "../../services";
import {AxiosResponse} from "axios";

interface IViewModel extends ng.IController, ICardDeleteProps {
    submitDelete?(): Promise<void>;

    closeForm(): void;
}

interface ICardDeleteProps {
    onSubmit?;
    display: boolean;
    boardId: string
    cardIds: Array<string>;
}

interface ICardDeleteScope extends IScope, ICardDeleteProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    boardId: string;
    cardIds: Array<string>;

    constructor(private $scope: ICardDeleteScope,
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
        templateUrl: `${RootsConst.directive}card-delete-lightbox/card-delete-lightbox.html`,
        scope: {
            display: '=',
            onSubmit: '&',
            cardIds: '=',
            boardId: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardDeleteScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitDelete = async (): Promise<void> => {
                try {
                    if (vm.cardIds.length > 0) {
                        await cardsService.deleteCard(vm.boardId, vm.cardIds);
                    }
                    toasts.confirm('magneto.delete.cards.confirm');
                    $parse($scope.vm.onSubmit())({});
                    vm.closeForm();
                } catch (e) {
                    toasts.warning('magneto.delete.cards.error');
                    console.error(e);
                }
            }
        }
    }
}

export const cardDeleteLightbox = ng.directive('cardDeleteLightbox', directive)