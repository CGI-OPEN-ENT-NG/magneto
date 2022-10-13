import {ng} from "entcore";
import {ILocationService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Card} from "../../models";
import {RESOURCE_TYPE} from "../../core/enums/resource-type.enum";
import {EXTENSION_FORMAT} from "../../core/constants/extension-format.const";

interface IViewModel extends ng.IController, ICardPreviewProps {
    getExtension(fileName: string): string;

    videoIsFromWorkspace(): boolean;

    formatVideoUrl(url: string) : string;

    downloadFile(): void;
}

interface ICardPreviewProps {
    card: Card;
}

interface ICardListItemScope extends IScope, ICardPreviewProps {
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

    getExtension = (): string => {
        let result: string = this.RESOURCE_TYPES.DEFAULT;
        if (!!this.card.metadata.filename) {
            let extension: string;
            extension = this.card.metadata.filename.split('.').pop();
            result = this.getExtensionType(extension);
        }
        return result;
    }

    videoIsFromWorkspace = (): boolean => {
        return this.card.resourceUrl ?
            this.card.resourceUrl.toString().includes("workspace") : false;
    }

    formatVideoUrl = (url: string) : string => {
        return this.$sce.trustAsResourceUrl(url);
    }

    downloadFile = (): void => {
        window.location.href = `/workspace/document/${this.card.resourceId}`;
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

}

function directive() {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-list/card-preview-image.html`,
        scope: {
            card: '=',
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

export const cardPreviewImage = ng.directive('cardPreviewImage', directive)