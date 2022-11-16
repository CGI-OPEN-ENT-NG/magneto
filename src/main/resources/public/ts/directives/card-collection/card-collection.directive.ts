import {_, ng, notify, toasts} from "entcore";
import {IParseService, IScope} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {Board, Card, CardCollection, Cards, ICardsBoardParamsRequest, ICardsParamsRequest} from "../../models";
import {safeApply} from "../../utils/safe-apply.utils";
import {AxiosError, AxiosResponse} from "axios";
import {cardsService} from "../../services";
import {CardsFilter} from "../../models/cards-filter.model";
import {Object} from "core-js";
import {InfiniteScrollService} from "../../shared/services";
import {COLLECTION_NAVBAR_VIEWS} from "../../core/enums/collection-navbar.enum";

interface IViewModel extends ng.IController, ICardCollectionProps {
    closeForm(): void;

    resetCards(): Promise<void>;

    getCards(): Promise<void>;

    getCardsByBoardId(boardId: string): Promise<void>;

    getCardsByBoard(): Promise<void>;

    hideCardsByBoardId(boardId: string): void;

    submitDuplicate?(card?: Card): Promise<void>;

    onSearchCard(searchText: string): Promise<void>;

    getDisplayedCollectionCards(cards?: Array<Card>): void;

    openPreview(card: Card): void;

    changeView(): void;

    changeNav(navbarView: COLLECTION_NAVBAR_VIEWS): Promise<void>;

    isFormValid (): boolean;

    onScroll(): Promise<void>;

    cards: Array<Card>;
    displayedCard: Array<CardCollection>;

    displayBoard: boolean;
    displayPreview: boolean;
    displayScroll: boolean;

    selectedCardIds: Array<string>;
    selectedCard: Card;

    filter: CardsFilter;

    navbarViewSelected: COLLECTION_NAVBAR_VIEWS;
    isLoading: boolean;

    infiniteScrollService: InfiniteScrollService;


}

interface ICardCollectionProps {
    display: boolean;
    board: Board;
    onSubmit?;

}

interface ICardCollectionScope extends IScope, ICardCollectionProps {
    vm: IViewModel;
}

class Controller implements IViewModel {

    board: Board;
    cards: Array<Card>;
    displayedCard: Array<CardCollection>;
    selectedCardIds: Array<string>;
    selectedCard: Card;

    display: boolean;
    displayBoard: boolean;
    displayPreview: boolean;
    displayScroll: boolean;

    filter: CardsFilter;

    navbarViewSelected: COLLECTION_NAVBAR_VIEWS;
    isLoading: boolean;

    infiniteScrollService: InfiniteScrollService;


    constructor(private $scope: ICardCollectionScope) {
        this.cards = [];
        this.displayedCard = [];
        this.selectedCardIds = [];
        this.selectedCard = new Card();
        this.displayBoard = false;
        this.displayPreview = false;
        this.isLoading = true;
        this.filter = new CardsFilter();
        this.infiniteScrollService = new InfiniteScrollService;
        this.navbarViewSelected = COLLECTION_NAVBAR_VIEWS.MY_CARDS;
    }

    async $onInit() {
        await this.getCards();
    }

    closeForm = (): void => {
        this.display = false;
    }

    $onDestroy() {
    }

    isFormValid = (): boolean => {
        return this.selectedCardIds && this.selectedCardIds.length > 0;
    }

    /**
     * On scroll callback:
     * - load more boards if scroll is at the bottom of the page
     */
    onScroll = async (): Promise<void> => {
        if (this.cards && this.cards.length > 0) {
            this.filter.nextPage();
            await this.getCards();
        }
    }

    changeView = (): void => {
        if (this.displayBoard) {
            this.getDisplayedCollectionCards();
        } else {
            this.displayedCard = [];
        }
        safeApply(this.$scope);
    }


    getDisplayedCollectionCards = (cards?: Array<Card>): void => {
        let boards: CardCollection[];
        boards = Object.entries(_.groupBy(cards || this.cards, 'boardId')).map(board => {
            return board.length > 1 ? new CardCollection(board[0], board[1]) : null;
        });

        boards.forEach((collection: CardCollection) => {
            if (this.displayedCard.length > 0) {
                if (_.last(this.displayedCard).boardId == collection.boardId) {
                    _.last(this.displayedCard).cards = _.last(this.displayedCard).cards.concat(collection.cards)
                } else {
                    this.displayedCard.push(collection);
                }
            } else {
                this.displayedCard.push(collection);
            }
        })
        safeApply(this.$scope);
    }

    getCardsByBoardId = async (boardId: string): Promise<void> => {
        this.isLoading = true;
        const params: ICardsParamsRequest = {
            boardId: boardId
        };
        cardsService.getAllCardsByBoard(params)
            .then((res: Cards) => {
                if (res.all && res.all.length > 0) {
                    let ids: Set<string> = new Set(this.findCardCollection(boardId).cards.map((card: Card) => card.id));
                    this.findCardCollection(boardId).cards = [...this.findCardCollection(boardId).cards, ...res.all.filter(card => !ids.has(card.id))];
                    this.findCardCollection(boardId).isLinkedCardsDisplay = true;
                }
                this.isLoading = false;
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                this.isLoading = false;
                notify.error(err.message)
            });
    }

    hideCardsByBoardId = (boardId: string): void => {
        this.findCardCollection(boardId).cards = this.cards.filter(card => card.boardId == boardId);
        this.findCardCollection(boardId).isLinkedCardsDisplay = false;
        safeApply(this.$scope);
    }

    private findCardCollection = (boardId: string): CardCollection => {
        return this.displayedCard.find(collection => {
            return collection.boardId == boardId;
        })
    }

    private isCurrentViewNav = (view: COLLECTION_NAVBAR_VIEWS): boolean => {
        return this.navbarViewSelected === view;
    }

    changeNav = async (navbarView: COLLECTION_NAVBAR_VIEWS): Promise<void> => {
        this.navbarViewSelected = navbarView;
        this.filter.isShared = this.isCurrentViewNav(COLLECTION_NAVBAR_VIEWS.SHARED_CARDS);
        this.filter.isPublic = this.isCurrentViewNav(COLLECTION_NAVBAR_VIEWS.PUBLIC_CARDS);
        await this.resetCards();
        safeApply(this.$scope);
    }

    getCards = async (): Promise<void> => {
        this.isLoading = true;
        const params: ICardsParamsRequest = {
            page: this.filter.page,
            sortBy: this.filter.sortBy,
            searchText: this.filter.searchText,
            boardId: this.board.id,
            isShared: this.filter.isShared,
            isPublic: this.filter.isPublic
        };
        cardsService.getAllCardsCollection(params)
            .then((res: Cards) => {
                if (res.all && res.all.length > 0) {
                    this.cards.push(...res.all);
                    if (this.displayBoard) {
                        this.getDisplayedCollectionCards(res.all);
                    }
                    this.infiniteScrollService.updateScroll();
                }
                this.isLoading = false;
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                this.isLoading = false;
                notify.error(err.message)
            });
    }

    /**
     * Callback on card search.
     */
    onSearchCard = async (): Promise<void> => {
        await this.resetCards();
        safeApply(this.$scope);
    }

    resetCards = async (): Promise<void> => {
        this.filter.page = 0;
        this.cards = [];
        this.selectedCardIds = [];
        this.displayedCard = [];
        await this.getCards();
    }

    getCardsByBoard = async (): Promise<void> => {
        await this.getCards();
    }

    openPreview = (card: Card): void => {
        this.selectedCard = card;
        this.displayPreview = true;
    }
}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}card-collection/card-collection.html`,
        scope: {
            display: '=',
            board: '=',
            onSubmit: '&'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', Controller],
        /* interaction DOM/element */
        link: function ($scope: ICardCollectionScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {
            vm.submitDuplicate = async (card?: Card): Promise<void> => {
                try {
                    const params: ICardsBoardParamsRequest = {
                        boardId: vm.board.id,
                        cardIds: card ? [card.id] : vm.selectedCardIds
                    };
                    await cardsService.duplicateCard(params)
                        .then(async (response: AxiosResponse) => {
                            if (response.status === 200 || response.status === 201) {
                                toasts.confirm('magneto.duplicate.cards.confirm');
                                $parse($scope.vm.onSubmit())({});
                                await vm.resetCards();
                                vm.closeForm();
                            }
                        })
                        .catch((err: AxiosError) => {
                            notify.error(err.message)
                        });
                } catch (e) {
                    toasts.warning('magneto.duplicate.cards.error');
                    console.error(e);
                }
            }
        }
    }
}

export const cardCollection = ng.directive('cardCollection', directive)