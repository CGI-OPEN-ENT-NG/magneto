import {ng, notify} from "entcore";
import {IScope} from "angular";
import {IBoardsService, ICardsService} from "../services";
import {Board, Boards, Card, Cards} from "../models";
import {safeApply} from "../utils/safe-apply.utils";
import {AxiosError} from "axios";

interface IViewModel {


    card: Card;
    board: Board;

    filter: {
        page: number,
        count: number,
        boardId: string
    };

    getCard(): Promise<void>;

    nextPage(): Promise<void>;

    previousPage(): Promise<void>;

    isLastPage(): boolean;

    goToBoard(): void;

}

interface ICardsScope extends IScope {
    vm: IViewModel;
}

class Controller implements ng.IController, IViewModel {

    card: Card;
    board: Board;

    filter: {
        page: number,
        count: number,
        boardId: string;
    };


    constructor(private $scope: ICardsScope,
                private $route: any,
                private $location: ng.ILocationService,
                private $sce: ng.ISCEService,
                private boardsService: IBoardsService,
                private cardsService: ICardsService) {
        this.$scope.vm = this;
    }

    async $onInit(): Promise<void> {


        this.filter = {
            page: 0,
            count: 0,
            boardId: (this.$route.current && this.$route.current.params) ? this.$route.current.params.boardId : null
        };

        this.board = new Board();
        await this.getBoard();
        await this.getCard();
        this.filter.count = this.board.cardIds.length;
        safeApply(this.$scope);
    }

    async nextPage(): Promise<void> {
        this.filter.page++;
        await this.getCard();
        safeApply(this.$scope);
    }

    async previousPage(): Promise<void> {
        this.filter.page--;
        await this.getCard();
        safeApply(this.$scope);
    }

    getBoard = async (): Promise<void> => {
        return this.boardsService.getBoardsByIds([this.filter.boardId])
            .then((res: Boards) => {
                if (!!res && res.all.length > 0) {
                    this.board = res.all[0];
                }
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                notify.error(err.message)
            });
    }

    getCard = async (): Promise<void> => {
        return this.cardsService.getCardById(this.board.cardIds[this.filter.page])
            .then((res: Card) => {
                if (!!res) {
                    this.card = res;
                }
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                notify.error(err.message)
            });
    }

    isLastPage = (): boolean => {
        return this.filter.count == this.filter.page + 1;
    }

    goToBoard(): void {
        this.$location.path(`/board/view/${this.board.id}`);
    }

    $onDestroy() {
    }

}

export const boardReadController = ng.controller('BoardReadController',
    ['$scope', '$route', '$location', '$sce', 'BoardsService', 'CardsService', Controller]);