import {ng, notify, toasts} from "entcore";
import {IScope, IWindowService} from "angular";
import {cardsService, IBoardsService, ICardsService} from "../services";
import {
    Board,
    Boards,
    BoardForm,
    Card,
    CardForm,
    Cards,
    ICardsParamsRequest,
    ICardsBoardParamsRequest
} from "../models";
import {safeApply} from "../utils/safe-apply.utils";
import {AxiosError, AxiosResponse} from "axios";
import {InfiniteScrollService} from "../shared/services";
import {EventBusService} from "../shared/event-bus-service/event-bus-sockjs.service";
import * as SockJS from "sockjs-client";
import {RESOURCE_TYPE} from "../core/enums/resource-type.enum";

interface IViewModel extends ng.IController {

    displayCardLightbox: boolean;
    displayUpdateCardLightbox: boolean;
    displayDeleteCardLightbox: boolean;
    displayTransferCardLightbox: boolean;
    displayPreviewCardLightbox: boolean;
    displayMediaLibraryLightbox: boolean;
    displayAudioMediaLibraryLightbox: boolean;
    displayBoardPropertiesLightbox: boolean;
    displayCollectionLightbox: boolean;
    displayLinkerLightbox: boolean;
    displayVideoResourceLightbox : boolean

    cardForm: CardForm;
    selectedCard: Card;

    videoUrl: string;

    cards: Array<Card>;
    board: Board;
    boardForm: BoardForm;

    filter: {
        page: number,
        boardId: string
    };

    isLoading: boolean;

    infiniteScrollService: InfiniteScrollService;

    goToBoards(): void;

    getCards(): Promise<void>;

    openAddResourceLightbox(resourceType: RESOURCE_TYPE): void;
    openEditResourceLightbox(card: Card): void;
    openDuplicateCard(card: Card): Promise<void>
    openReading(): void;
    onFormSubmit(): Promise<void>;
    onBoardFormSubmit(): Promise<void>;
    onScroll(): void;

    resetCards(): void;

    onFileSelected(file: any) : Promise<void>;
    onVideoSelected(videoHtml: string) : void;
    onLinkSubmit(form: {url: "", title: ""}) : void;
    getMediaLibraryFileFormat(): string;
    openBoardPropertiesForm(): void;
}

interface IBoardViewScope extends IScope {
    vm: IViewModel;
}

class Controller implements IViewModel {

    private eventBusService: EventBusService;

    displayCardLightbox: boolean;
    displayUpdateCardLightbox: boolean;
    displayDeleteCardLightbox: boolean;
    displayTransferCardLightbox: boolean;
    displayPreviewCardLightbox: boolean;

    cards: Array<Card>;
    board: Board;
    boardForm: BoardForm;
    displayMediaLibraryLightbox: boolean;
    displayCollectionLightbox: boolean;
    displayAudioMediaLibraryLightbox: boolean;
    displayVideoResourceLightbox : boolean;

    displayBoardPropertiesLightbox: boolean;
    displayLinkerLightbox: boolean;

    selectedCard: Card;
    cardForm: CardForm;

    videoUrl: string;

    isLoading: boolean;

    filter: {
        page: number,
        boardId: string;
    };

    infiniteScrollService: InfiniteScrollService;

    constructor(private $scope: IBoardViewScope,
                private $route: any,
                private $location: ng.ILocationService,
                private $sce: ng.ISCEService,
                private $timeout: ng.ITimeoutService,
                private $window: IWindowService,
                private boardsService: IBoardsService,
                private cardsService: ICardsService) {
        this.$scope.vm = this;
        this.infiniteScrollService = new InfiniteScrollService;
    }

    async $onInit(): Promise<void> {
        this.displayCardLightbox = false;
        this.displayDeleteCardLightbox = false;
        this.displayTransferCardLightbox = false;
        this.displayMediaLibraryLightbox = false;
        this.displayCollectionLightbox = false;
        this.displayVideoResourceLightbox = false;
        this.$window.scrollTo(0, 0);

        this.displayBoardPropertiesLightbox = false;
        this.displayLinkerLightbox = false;
        this.displayPreviewCardLightbox = false;

        this.cards = [];
        this.board = new Board();

        this.boardForm = new BoardForm();
        this.cardForm = new CardForm();
        this.selectedCard = new Card();

        this.filter = {
            page: 0,
            boardId: (this.$route.current && this.$route.current.params) ? this.$route.current.params.boardId : null
        };

        this.isLoading = true;

        await this.getBoard();
        await this.getCards();
    }

    /**
     * Go to boards page (Magneto main page)
     */
    goToBoards(): void {
        this.$location.path(`/boards`);
    }

    /**
     * Open the add resource lightbox
     * @param resourceType the type of resource to add
     */
    openAddResourceLightbox = (resourceType: RESOURCE_TYPE): void => {
        this.cardForm = new CardForm();
        this.cardForm.resourceType = resourceType;
        this.displayUpdateCardLightbox = false;

        switch (resourceType) {
            case RESOURCE_TYPE.IMAGE:
                this.displayMediaLibraryLightbox = true;
                break;
            case RESOURCE_TYPE.VIDEO:
                this.displayVideoResourceLightbox = true;
                break;
            case RESOURCE_TYPE.FILE:
                this.displayMediaLibraryLightbox = true;
                break;
            case RESOURCE_TYPE.TEXT:
                this.displayCardLightbox = true;
                break;
            case RESOURCE_TYPE.AUDIO:
                this.displayAudioMediaLibraryLightbox = true;
                break;
            case RESOURCE_TYPE.LINK:
                this.displayLinkerLightbox = true;
                break;
            case RESOURCE_TYPE.CARD:
                this.displayCollectionLightbox = true;
                break;
        }
    }

    /**
     * Open reading board page
     */
    openReading = (): void => {
        this.$location.path(`/board/view/reading/${this.board.id}`);
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
     * Open card edition form.
     */
    openPreviewResourceLightbox = (card: Card): void => {
        this.selectedCard = card;
        this.displayPreviewCardLightbox = true;
    }

    /**
     * Open card deletion lightbox.
     */
    openDeleteResourceLightbox = (card: Card): void => {
        this.selectedCard = card;
        this.displayDeleteCardLightbox = true;
    }

    /**
     * Open card move lightbox.
     */
    openTransferResourceLightbox = (card: Card): void => {
        this.cardForm = new CardForm().build(card);
        this.displayTransferCardLightbox = true;
    }

    /**
     * Callback on form submit:
     * - refresh cards
     */
    onFormSubmit = async (): Promise<void> => {
        this.displayMediaLibraryLightbox = false;
        this.resetCards();
        await Promise.all([this.getCards(), this.getBoard()]);
    }

    /**
     * Fetch board infos.
     */
    getBoard = async (): Promise<void> => {
        this.isLoading = true;
        return this.boardsService.getBoardsByIds([this.filter.boardId])
            .then((res: Boards) => {
                if (!!res) {
                    this.board = res.all[0];
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
     * Fetch board cards.
     */
    getCards = async (): Promise<void> => {
        this.isLoading = true;
        const params: ICardsParamsRequest = {
            page: this.filter.page,
            boardId: this.filter.boardId
        };
        this.cardsService.getAllCardsByBoard(params)
            .then((res: Cards) => {
                if (res.all && res.all.length > 0) {
                    this.cards.push(...res.all);
                }
                this.isLoading = false;
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                this.isLoading = false;
                notify.error(err.message)
            });
    }

    openDuplicateCard = async (card?: Card): Promise<void> => {
        try {
            const params: ICardsBoardParamsRequest = {
                boardId: this.board.id,
                cardIds: [card.id]
            };
            await this.cardsService.duplicateCard(params)
                .then(async (response: AxiosResponse) => {
                    if (response.status === 200 || response.status === 201) {
                        toasts.confirm('magneto.duplicate.cards.confirm');
                        await this.onFormSubmit()
                        await this.resetCards();
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

    /**
     * Callback on board properties form submit
     */
    onBoardFormSubmit = async (): Promise<void> => {
        this.displayBoardPropertiesLightbox = false;
        await this.getBoard();
        safeApply(this.$scope);
    }

    /**
     * Reset cards filter
     */
    resetCards = (): void => {
        this.filter.page = 0;
        this.cards = [];
    }

    /**
     * Callback on media library form submit
     * @param file the card file
     */
    onFileSelected = async (file: any): Promise<void> => {
        this.displayMediaLibraryLightbox = false;
        this.cardForm.title = "";
        this.cardForm.description = "";
        this.cardForm.caption = "";
        this.cardForm.resourceId = file._id;
        this.cardForm.resourceFileName = file.metadata.filename;

        this.$timeout(() => {
            this.displayCardLightbox = true;
        }, 100);
    }

    /**
     * Callback on video form submit
     */
    onVideoSelected = () : void => {
        this.displayVideoResourceLightbox = false;

        // Video from workspace
        if (this.videoUrl.includes("workspace")) {
            this.cardForm.resourceUrl = this.videoUrl.split("src=\"")[1].split('\"')[0];
        }
        // Video from URL
        else {
            this.cardForm.resourceUrl = this.$sce.trustAsResourceUrl(
                this.videoUrl.split("src=\"")[1].split('"')[0]);
        }

        this.displayCardLightbox = true;
        safeApply(this.$scope);
    }

    /**
     * Callback on link form submit
     * @param form
     */
    onLinkSubmit = (form: {url: "", title: ""}) : void => {
        this.cardForm.resourceUrl = this.$sce.trustAsResourceUrl(form.url).toString();
        this.cardForm.title = form.title;
        this.$timeout(() => {
            this.displayCardLightbox = true;
        }, 100);
    }

    /**
     * Get cardForm file format for media library
     */
    getMediaLibraryFileFormat = (): string => {
        switch (this.cardForm.resourceType) {
            case RESOURCE_TYPE.IMAGE:
                return 'img';
            case RESOURCE_TYPE.FILE:
                return 'any';
            default:
                return 'any';
        }
    }

    /**
     * Open board properties form.
     */
    openBoardPropertiesForm = (): void => {
        this.boardForm = new BoardForm().build(this.board);
        this.displayBoardPropertiesLightbox = true;
    }

    $onDestroy() {
    }

    /**
     * Callback on infinite scroll
     */
    onScroll = async (): Promise<void> => {
        if (this.cards.length > 0) {
            this.filter.page++;
            await this.getCards();
        }
    }
}

export const boardViewController = ng.controller('BoardViewController',
    ['$scope', '$route', '$location','$sce', '$timeout', '$window', 'BoardsService', 'CardsService', Controller]);