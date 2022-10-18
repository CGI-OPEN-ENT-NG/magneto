import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Card} from "../../models";
import {DateUtils} from "../../utils/date.utils";
import {RESOURCE_TYPE} from "../../core/enums/resource-type.enum";
import {safeApply} from "../../utils/safe-apply.utils";

interface IViewModel extends ng.IController, ICardListItemProps {
    formatDate(date: string): string;

    formatDateModification(date: string): string;

    openCardOptions(): Promise<void>;

    openEdit?(card: Card): void;

    openDuplicate?(card: Card): void;

    openHide?(card: Card): void;

    openDelete?(card: Card): void;

    isDisplayedOptions: boolean;

}

interface ICardListItemProps {
    card: Card;
    isDraggable: boolean;
    hasOptions: boolean;
}

interface ICardListItemScope extends IScope, ICardListItemProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    card: Card;
    isDisplayedOptions: boolean;
    isDraggable: boolean;
    hasOptions: boolean;

    RESOURCE_TYPES: typeof RESOURCE_TYPE;


    constructor(private $scope: ICardListItemScope,
                private $location: ILocationService,
                private $window: IWindowService) {
        this.RESOURCE_TYPES = RESOURCE_TYPE;
        this.isDisplayedOptions = false;
    }

    $onInit() {
    }

    $onDestroy() {
    }

    formatDateModification = (date: string): string => {
        return DateUtils.createdSince(date, DateUtils.FORMAT["DAY-MONTH-HALFYEAR"])
    }

    formatDate = (date: string): string => {
        return DateUtils.format(date, DateUtils.FORMAT["DAY-MONTH-HALFYEAR-HOUR-MIN-SEC"])
    }


    getLastUserId = (card: Card): string => {
        return !!card.lastModifierId ? card.lastModifierId : card.ownerId;
    }

    getLastUserName = (card: Card): string => {
        return !!card.lastModifierName ? card.lastModifierName : card.ownerName;
    }

    openCardOptions = async (): Promise<void> => {
        this.isDisplayedOptions = !this.isDisplayedOptions;
        await safeApply(this.$scope);
    }
}

function directive($parse: IParseService) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-list/card-list-item.html`,
        scope: {
            card: '=',
            hasOptions: '=',
            isDraggable: '=',
            onEdit: '&',
            onDuplicate: '&',
            onHide: '&',
            onDelete: '&',
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardListItemScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
            $(document).bind('click', (event: JQueryEventObject): void => {
                if(!element.find(event.target).length && vm.isDisplayedOptions) {
                    vm.isDisplayedOptions = false;
                    $scope.$apply();
                }
            });
            vm.openEdit = (card: Card): void => {
                $parse($scope.vm.onEdit())(card);
            }

            vm.openDuplicate = (card: Card): void => {
                $parse($scope.vm.onDuplicate())(card);
            }

            vm.openHide = (card: Card): void => {
                $parse($scope.vm.onHide())(card);
            }

            vm.openDelete = (card: Card): void => {
                $parse($scope.vm.onDelete())(card);
            }
        }
    }
}

export const cardListItem = ng.directive('cardListItem', directive)