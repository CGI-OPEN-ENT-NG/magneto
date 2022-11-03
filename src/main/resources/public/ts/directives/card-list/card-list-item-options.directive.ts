import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Card} from "../../models";

interface IViewModel extends ng.IController, ICardListItemOptionsProps {
    openEdit?(): void;
    openDuplicate?(): void;
    openHide?(): void;
    openDelete?(): void;
    openPreview?(): void;
    openTransfer?(): void;
}

interface ICardListItemOptionsProps {
    card: Card;
    isDisplayed: boolean;
    hasEdit: boolean;
    onEdit?;
    hasDuplicate: boolean;
    onDuplicate?;
    hasHide: boolean;
    onHide?;
    hasDelete: boolean;
    onDelete?;
    hasPreview: boolean;
    onPreview?;
    hasTransfer: boolean;
    onTransfer?;
}

interface ICardListItemOptionsScope extends IScope, ICardListItemOptionsProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    card: Card;
    isDisplayed: boolean;
    hasEdit: boolean;
    hasDuplicate: boolean;
    hasHide: boolean;
    hasDelete: boolean;
    hasPreview: boolean;
    hasTransfer: boolean;

    constructor(private $scope: ICardListItemOptionsScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit() {
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-list/card-list-item-options.html`,
        scope: {
            card: '=',
            isDisplayed: '=',
            hasEdit: '=',
            onEdit: '&',
            hasDuplicate: '=',
            onDuplicate: '&',
            hasHide: '=',
            onHide: '&',
            hasDelete: '=',
            onDelete: '&',
            hasPreview: '=',
            onPreview: '&',
            hasTransfer: '=',
            onTransfer: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardListItemOptionsScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
            vm.openEdit = (): void => {
                element.click(function (event) {
                    event.stopPropagation();
                });
               $parse($scope.vm.onEdit())(vm.card);
            }

            vm.openDuplicate = (): void => {
                element.click(function (event) {
                    event.stopPropagation();
                });
                $parse($scope.vm.onDuplicate())(vm.card);
            }

            vm.openHide = (): void => {
                element.click(function (event) {
                    event.stopPropagation();
                });
                $parse($scope.vm.onHide())(vm.card);
            }

            vm.openDelete = (): void => {
                element.click(function (event) {
                    event.stopPropagation();
                });
                $parse($scope.vm.onDelete())(vm.card);
            }

            vm.openPreview = (): void => {
                element.click(function (event) {
                    event.stopPropagation();
                });
                $parse($scope.vm.onPreview())(vm.card);
            }

            vm.openTransfer = (): void => {
                element.click(function (event) {
                    event.stopPropagation();
                });
                $parse($scope.vm.onTransfer())(vm.card);
            }
        }
    }
}

export const cardListItemOptions = ng.directive('cardListItemOptions', directive)