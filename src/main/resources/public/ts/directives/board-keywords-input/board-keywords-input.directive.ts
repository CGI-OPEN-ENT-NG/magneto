import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board} from "../../models";

interface IViewModel extends ng.IController, IBoardKeywordsInputProps {
    updateKeywords(): void;
}

interface IBoardKeywordsInputProps {
    board: Board;
}

interface IBoardKeywordsInputScope extends IScope, IBoardKeywordsInputProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    board: Board;

    constructor(private $scope: IBoardKeywordsInputScope,
                private $location: ILocationService,
                private $window: IWindowService,
                private $parse: IParseService) {
    }

    $onInit() {
    }

    $onDestroy() {
    }

    updateKeywords = (): void => {
        if (this.board.tagsTextInput.length > 0 && this.board.tagsTextInput[this.board.tagsTextInput.length - 1] == ",") {
            this.board.tagsTextInput = this.board.tagsTextInput.replace(",", "");
            return;
        }

        if (this.board.tagsTextInput.length > 0 && this.board.tagsTextInput[this.board.tagsTextInput.length - 1] === " ") {
            let inputArray: string[] = this.board.tagsTextInput.split(" ");

            inputArray = inputArray.map((keyword: string) => {
                if (keyword === '') {
                    return '';
                } else if (keyword[0] === "#") {
                    return keyword;
                } else {
                    return "#" + keyword;
                }
            });
            this.board.tagsTextInput = inputArray.toString().replace(/,/g, " ");
        }


        this.board.tags = this.board.tagsTextInput.split(" ").filter((keyword: string) => keyword != '').map((keyword: string) => keyword.substring(1).toLowerCase());
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}/board-keywords-input/board-keywords-input.html`,
        scope: {
            board: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IBoardKeywordsInputScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

        }
    }
}

export const boardKeywordsInput = ng.directive('boardKeywordsInput', directive)