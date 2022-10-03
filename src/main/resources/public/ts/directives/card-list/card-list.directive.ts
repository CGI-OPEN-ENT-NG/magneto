import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Card} from "../../models";

interface IViewModel extends ng.IController, ICardListProps {
    openEdit?(card: Card): void;
    openDuplicate?(card: Card): void;
    openHide?(card: Card): void;
    openDelete?(card: Card): void;
}

interface ICardListProps {
    cards: Array<Card>;
}

interface ICardListScope extends IScope, ICardListProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    cards: Array<Card>;
    constructor(private $scope: ICardListScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit = (): void => {
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-list/card-list.html`,
        scope: {
            cards: '=',
            onEdit: '&',
            onDuplicate: '&',
            onHide: '&',
            onDelete: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardListScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
            vm.openEdit = (card: Card): void => {
                $parse($scope.vm.onEdit())(card);
            }

            vm.openDuplicate = (card: Card): void => {
                $parse($scope.vm.onDuplicate())(vm.card);
            }

            vm.openHide = (card: Card): void => {
                $parse($scope.vm.onHide())(vm.card);
            }

            vm.openDelete = (card: Card): void => {
                $parse($scope.vm.onDelete())(card);
            }
        }
    }
}

export const cardList = ng.directive('cardList', directive)