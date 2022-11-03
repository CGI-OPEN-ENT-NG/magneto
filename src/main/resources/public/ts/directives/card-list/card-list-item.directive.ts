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

    openCardOptions($event: MouseEvent): Promise<void>;

    hasOptions(): boolean;

    openEdit?(card: Card): void;

    openDuplicate?(card: Card): void;

    openHide?(card: Card): void;

    openDelete?(card: Card): void;

    openPreview?(card: Card): void;

    openTransfer?(card: Card): void;

    isDisplayedOptions: boolean;
    isSelected: boolean;


}

interface ICardListItemProps {
    card: Card;

    isDraggable: boolean;
    hasCaption: boolean;

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

interface ICardListItemScope extends IScope, ICardListItemProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    card: Card;
    isDisplayedOptions: boolean;
    isDraggable: boolean;

    hasCaption: boolean;

    hasEdit: boolean;
    hasDuplicate: boolean;
    hasHide: boolean;
    hasDelete: boolean;
    hasPreview: boolean;
    hasTransfer: boolean;


    isSelected: boolean;
    RESOURCE_TYPES: typeof RESOURCE_TYPE;


    constructor(private $scope: ICardListItemScope,
                private $location: ILocationService,
                private $window: IWindowService) {
        this.RESOURCE_TYPES = RESOURCE_TYPE;
        this.isDisplayedOptions = false;
        this.isSelected = false;
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

    openCardOptions = async ($event: MouseEvent): Promise<void> => {
        $event.stopPropagation();
        this.isDisplayedOptions = !this.isDisplayedOptions;
        await safeApply(this.$scope);
    }

    hasOptions = (): boolean => {
        return this.hasDelete || this.hasPreview || this.hasEdit || this.hasHide || this.hasDuplicate;
    }

}

function directive($parse: IParseService) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-list/card-list-item.html`,
        scope: {
            card: '=',
            isSelected: '=',
            isDraggable: '=',
            hasCaption: '=',
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

            vm.openPreview = (card: Card): void => {
                $parse($scope.vm.onPreview())(card);
            }

            vm.openTransfer = (card: Card): void => {
                $parse($scope.vm.onTransfer())(card);
            }
        }
    }
}

export const cardListItem = ng.directive('cardListItem', directive)