import {ng, notify} from "entcore";
import {IScope} from "angular";
import {IBoardsService, ICardsService} from "../services";
import {Board, Boards, Card, CardForm, Cards, ICardsParamsRequest} from "../models";
import {safeApply} from "../utils/safe-apply.utils";
import {AxiosError} from "axios";
import {InfiniteScrollService} from "../shared/services";
import {EventBusService} from "../shared/event-bus-service/event-bus-sockjs.service";
import * as SockJS from "sockjs-client";

interface IViewModel extends ng.IController {

    displayCardLightbox: boolean;
    displayUpdateCardLightbox: boolean;
    displayDeleteCardLightbox: boolean;


    cardForm: CardForm;
    selectedCard: Card;


    cards: Array<Card>;
    board: Board;

    filter: {
        page: number,
        boardId: string
    };

    infiniteScrollService: InfiniteScrollService;

    goToBoards(): void;

    getCards(): Promise<void>;

    onScroll(): void;

    resetCards(): void;

}

interface IBoardViewScope extends IScope {
    vm: IViewModel;
}

class Controller implements IViewModel {

    private eventBusService: EventBusService;

    displayCardLightbox: boolean;
    displayUpdateCardLightbox: boolean;
    displayDeleteCardLightbox: boolean;

    cards: Array<Card>;
    board: Board;

    selectedCard: Card;
    cardForm: CardForm;


    filter: {
        page: number,
        boardId: string;
    };

    infiniteScrollService: InfiniteScrollService;

    constructor(private $scope: IBoardViewScope,
                private $route: any,
                private $location: ng.ILocationService,
                private $sce: ng.ISCEService,
                private boardsService: IBoardsService,
                private cardsService: ICardsService) {
        this.$scope.vm = this;
        this.infiniteScrollService = new InfiniteScrollService;
    }

    async $onInit(): Promise<void> {
        this.displayCardLightbox = false;
        this.displayDeleteCardLightbox = false;

        this.cards = [];
        this.board = new Board();
        this.cardForm = new CardForm();
        this.selectedCard = new Card();

        this.filter = {
            page: 0,
            boardId: (this.$route.current && this.$route.current.params) ? this.$route.current.params.boardId : null
        };

        await this.getBoard();
        await this.getCards();
    }

    goToBoards(): void {
        this.$location.path(`/boards`);
    }

    /**
     * Open card edition form.
     */
    openEditResourceLightbox = (card: Card): void => {
        this.cardForm = new CardForm().build(card);
        this.cardForm.resourceFileName = card.metadata ? card.metadata.filename : '';
        this.displayUpdateCardLightbox = true;
        this.displayCardLightbox = true;
    }

    /**
     * Open card deletion lightbox.
     */
    openDeleteResourceLightbox = (card: Card): void => {
        this.selectedCard = card;
        this.displayDeleteCardLightbox = true;
    }

    /**
     * Callback on form submit:
     * - refresh cards
     */
    onFormSubmit = async (): Promise<void> => {
        this.resetCards();
        await this.getCards();
    }

    getBoard = async (): Promise<void> => {
        return this.boardsService.getBoardsByIds([this.filter.boardId])
            .then((res: Boards) => {
                if (!!res) {
                    this.board = res[0];
                }
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                notify.error(err.message)
            });
    }

    getCards = async (): Promise<void> => {
        const params: ICardsParamsRequest = {
            page: this.filter.page,
            boardId: this.filter.boardId
        };
        this.cardsService.getAllCards(params)
            .then((res: Cards) => {
                if (res.all && res.all.length > 0) {
                    this.cards.push(...res.all);
                }
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                notify.error(err.message)
            });
    }

    resetCards = (): void => {
        this.filter.page = 0;
        this.cards = [];
    }

    $onDestroy() {
    }

    onScroll = async (): Promise<void> => {
        if (this.cards.length > 0) {
            this.filter.page++;
            await this.getCards();
        }
    }
}

export const boardViewController = ng.controller('BoardViewController',
    ['$scope', '$route', '$location', '$sce', 'BoardsService', 'CardsService', Controller]);