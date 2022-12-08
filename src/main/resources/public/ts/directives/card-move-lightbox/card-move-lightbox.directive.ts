import {idiom as lang, ng, notify, toasts} from "entcore";
import {IParseService, IScope} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {boardsService, cardsService} from "../../services";
import {Board, Boards, Card, CardForm} from "../../models";
import {safeApply} from "../../utils/safe-apply.utils";
import {AxiosError} from "axios";
import {COMBO_LABELS} from "../../core/enums/comboLabel";

interface IViewModel extends ng.IController, ICardMoveProps {
    submitMove?(card: Card): Promise<void>;

    closeForm(): void;

    getBoards(): Promise<void>;

    isFormValid(): boolean;

    getLabelsTranslated(): void;

    boards: Array<Board>;

    selectedBoards: Array<Board>;

    comboLabels: typeof COMBO_LABELS;

    lang: typeof lang;
}

interface ICardMoveProps {
    onSubmit?;
    display: boolean;
    boardId: string
    form: CardForm;
}

interface ICardMoveScope extends IScope, ICardMoveProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    display: boolean;
    boardId: string;
    boards: Array<Board>;
    form: CardForm;
    selectedBoards: Array<Board>;
    comboLabels: typeof COMBO_LABELS;
    lang: typeof lang;

    constructor(private $scope: ICardMoveScope) {
        this.boards = [];
        this.selectedBoards = [];
        this.comboLabels = COMBO_LABELS;
    }

    async $onInit() {
        this.lang = lang;
        this.getLabelsTranslated();
        await this.getBoards();
    }

    closeForm = (): void => {
        this.display = false;
        this.selectedBoards = [];
    }

    $onDestroy() {
    }

    isFormValid = (): boolean => {
        return this.selectedBoards && this.selectedBoards.length > 0;
    }

    getLabelsTranslated = (): void => {
        this.comboLabels.selectAll = lang.translate(this.comboLabels.selectAll);
        this.comboLabels.deselectAll = lang.translate(this.comboLabels.deselectAll);
        this.comboLabels.searchPlaceholder = lang.translate(this.comboLabels.searchPlaceholder);
        this.comboLabels.options = lang.translate(this.comboLabels.options);
    };

    /**
     * Get all boards (owner + shared).
     */
    getBoards = async (): Promise<void> => {
        boardsService.getAllBoardsEditable()
            .then((res: Boards) => {
                if (res.all && res.all.length > 0) {
                    this.boards.push(...res.all);
                    this.boards = this.boards.filter(board => {
                        return board.id != this.boardId;
                    })
                    this.boards.forEach(board => {
                        board.toString = () => board.title;
                    });
                }
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                notify.error(err.message)
            });
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-move-lightbox/card-move-lightbox.html`,
        scope: {
            display: '=',
            onSubmit: '&',
            form: '=',
            boardId: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardMoveScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.submitMove = async (): Promise<void> => {
                try {
                    if (vm.isFormValid()) {
                        await cardsService.moveCard(vm.form, vm.selectedBoards[0].id);
                        toasts.confirm('magneto.move.cards.confirm');
                        $parse($scope.vm.onSubmit())({});
                        vm.closeForm();
                    } else {
                        toasts.warning('magneto.boards.empty.text');
                    }
                } catch (e) {
                    toasts.warning('magneto.move.cards.error');
                    console.error(e);
                }
            }
        }
    }
}

export const cardMoveLightbox = ng.directive('cardMoveLightbox', directive)