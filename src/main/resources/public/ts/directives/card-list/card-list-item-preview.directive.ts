import {idiom, ng} from "entcore";
import {ILocationService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Card} from "../../models";
import {RESOURCE_TYPE} from "../../core/enums/resource-type.enum";
import {EXTENSION_FORMAT} from "../../core/constants/extension-format.const";

interface IViewModel extends ng.IController, ICardListItemProps {
    getExtension(fileName: string): string;

    getResourceType(resourceType: string): string;

    videoIsFromWorkspace(): boolean;

    formatVideoUrl(url: string): string;

    getDescriptionHTML(description: string): string;
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

    getExtension = (fileName: string): string => {
        let result: string = this.RESOURCE_TYPES.DEFAULT;
        if (!!fileName) {
            let extension: string;
            extension = fileName.split('.').pop();
            result = this.getExtensionType(extension);
        }
        return result;
    }

    videoIsFromWorkspace = (): boolean => {
        return this.card.resourceUrl ?
            this.card.resourceUrl.toString().includes("workspace") : false;
    }

    getDescriptionHTML = (description: string): string => {
        return !!description ? this.$sce.trustAsHtml(description.toString()) : null;
    }

    formatVideoUrl = (url: string): string => {
        return !!url ? this.$sce.trustAsResourceUrl(url) : null;
    }

    private getExtensionType = (extension: string): string => {
        let result: string = "";
        if (EXTENSION_FORMAT.TEXT.some(element => element.includes(extension))) {
            result = this.RESOURCE_TYPES.TEXT;
        } else if (EXTENSION_FORMAT.PDF.some(element => element.includes(extension))) {
            result = this.RESOURCE_TYPES.PDF;
        } else if (EXTENSION_FORMAT.IMAGE.some(element => element.includes(extension))) {
            result = this.RESOURCE_TYPES.IMAGE;
        } else if (EXTENSION_FORMAT.AUDIO.some(element => element.includes(extension))) {
            result = this.RESOURCE_TYPES.AUDIO;
        } else if (EXTENSION_FORMAT.VIDEO.some(element => element.includes(extension))) {
            result = this.RESOURCE_TYPES.VIDEO;
        } else if (EXTENSION_FORMAT.SHEET.some(element => element.includes(extension))) {
            result = this.RESOURCE_TYPES.SHEET;
        } else {
            result = this.RESOURCE_TYPES.DEFAULT;
        }
        return result;
    }

    getResourceType = (): string => {
        return idiom.translate('magneto.card.type.' + this.card.resourceType);
    }

}

function directive() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-list/card-list-item-preview.html`,
        scope: {
            card: '=',
            resourceType: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$sce', '$window', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardListItemScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
        }
    }
}

export const cardListItemPreview = ng.directive('cardListItemPreview', directive)