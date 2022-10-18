import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {BoardForm, Card} from "../../models";
import { create } from 'sortablejs';
import {boardsService} from "../../services";

interface IViewModel extends ng.IController, ICardListProps {
    cardIds: Array<string>;
    openEdit?(card: Card): void;
    openDuplicate?(card: Card): void;
    openHide?(card: Card): void;
    openDelete?(card: Card): void;
}

interface ICardListProps {
    cards: Array<Card>;
    isDraggable: boolean;
    hasOptions: boolean;
}

interface ICardListScope extends IScope, ICardListProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    cards: Array<Card>;
    isDraggable: boolean;
    hasOptions: boolean;
    cardIds: Array<string>;

    constructor(private $scope: ICardListScope,
                private $location: ILocationService,
                private $window: IWindowService) {
        this.cardIds = [];
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
            hasOptions: '=',
            isDraggable: '=',
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

            const cardList: Element = document.getElementById("card-list");
            if (cardList) {
                create(cardList, {
                    animation: 150,
                    delay: 150,
                    delayOnTouchOnly: true,
                    onUpdate: async (evt) => {
                        if (vm.isDraggable && vm.cards && vm.cards.length > 0) {
                            vm.cardIds = vm.cards.map((card: Card) => card.id);
                            let movedCardId: string = vm.cardIds[evt.oldIndex];
                            let newCardIndex: number = evt.newIndex;
                            vm.cardIds.splice(evt.oldIndex, 1);
                            vm.cardIds.splice(newCardIndex, 0, movedCardId);
                            let form : BoardForm = new BoardForm();
                            form.cardIds = vm.cardIds;

                            await boardsService.updateBoard(vm.cards[0].boardId, form);
                        }
                    }
                })
            }

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