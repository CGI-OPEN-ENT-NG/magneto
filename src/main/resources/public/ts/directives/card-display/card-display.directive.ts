import {ng, workspace} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Card} from "../../models";
import {DateUtils} from "../../utils/date.utils";
import {RESOURCE_TYPE} from "../../core/enums/resource-type.enum";
import {I18nUtils} from "../../utils/i18n.utils";

interface IViewModel extends ng.IController, ICardListItemProps {
    formatDate(date: string): string;

    formatDateModification(date: string): string;

    getLastUserId(card: Card): string;

    getLastUserName(card: Card): string;

    getDescriptionHTML(description: string): string;

    getOwnerText(): string;

}

interface ICardListItemProps {
    card: Card;
}

interface ICardListItemScope extends IScope, ICardListItemProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    card: Card;

    RESOURCE_TYPES: typeof RESOURCE_TYPE;

    constructor(private $scope: ICardListItemScope,
                private $location: ILocationService,
                private $sce: ng.ISCEService,
                private $window: IWindowService) {
        this.RESOURCE_TYPES = RESOURCE_TYPE;
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


    getLastUserId = (): string => {
        return !!this.card.lastModifierId ? this.card.lastModifierId : this.card.ownerId;
    }

    getLastUserName = (): string => {
        return !!this.card.lastModifierName ? this.card.lastModifierName : this.card.ownerName;
    }

    getDescriptionHTML = (description: string): string => {
        return this.$sce.trustAsHtml(description.toString());
    }

    getOwnerText = (): string => {
        return I18nUtils.getWithParams("magneto.card.saved.by", [this.card.ownerName, this.getLastUserName()]);
    }

}

function directive($parse: IParseService) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-display/card-display.html`,
        scope: {
            card: '=',
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$sce', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardListItemScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
        }
    }
}

export const cardDisplay = ng.directive('cardDisplay', directive)