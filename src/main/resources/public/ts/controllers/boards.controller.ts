import {ng, notify} from "entcore";
import {IScope} from "angular";
import {IBoardsService} from "../services";
import {
    IBoardCategoriesParam,
    IBoardsParamsRequest,
    Boards, Board
} from "../models/board.model";
import {safeApply} from "../utils/safe-apply.utils";
import {AxiosError} from "axios";
import {InfiniteScrollService} from "../shared/services";

interface IViewModel {
    selectedFolderId: string;
    displayBoardLightbox: boolean;
    boards: Array<Board>;
    filter : {
        page: number,
        isTrash: boolean,
        isPublic: boolean
    },
    infiniteScrollService: InfiniteScrollService,

    getBoards(): Promise<void>;
    createBoard(): void;
    onFormSubmit(): Promise<void>;
    onCategorySwitch(categories: IBoardCategoriesParam): Promise<void>;
    onSearchBoard(searchText: string): Promise<void>;
    onScroll(): void;
    resetBoards(): void;
}

interface IBoardsScope extends IScope {
    vm: IViewModel;
}

class Controller implements ng.IController, IViewModel {

    selectedFolderId: string;
    displayBoardLightbox: boolean;
    boards: Array<Board>;
    filter : {
        page: number;
        isTrash: boolean;
        isPublic: boolean;
        searchText: string;
    };
    infiniteScrollService: InfiniteScrollService;

    constructor(private $scope: IBoardsScope,
                private boardsService: IBoardsService) {
        this.$scope.vm = this;
        this.infiniteScrollService = new InfiniteScrollService;

    }

    async $onInit(): Promise<void> {
        this.selectedFolderId = null;
        this.displayBoardLightbox = false;
        this.filter = {
            page: 0,
            isTrash: false,
            isPublic: false,
            searchText: ''
        };
        this.boards = [];
        await this.getBoards();
    }

    onSearchBoard = async (searchText: string): Promise<void> => {
        this.filter.searchText = searchText;
        this.filter.page = 0;
        this.boards = [];
        await this.getBoards();
    }

    onCategorySwitch = async (categories: IBoardCategoriesParam) : Promise<void> => {
        this.resetBoards();
        this.filter.isTrash = categories.isTrash;
        this.filter.isPublic = categories.isPublic;
        await this.getBoards();
    }

    createBoard = (): void => {
        this.displayBoardLightbox = true;
    }

    getBoards = async (): Promise<void> => {
        const params: IBoardsParamsRequest = {
            folderId: null,
            isPublic: this.filter.isPublic,
            isShared: null,
            isDeleted: this.filter.isTrash,
            searchText: this.filter.searchText,
            sortBy: 'modificationDate',
            page: this.filter.page
        };
        this.boardsService.getAllBoards(params)
            .then((res: Boards) => {
                if (res.all && res.all.length > 0) {
                    this.boards.push(...res.all);
                    this.infiniteScrollService.updateScroll();
                }

                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                notify.error(err.message)
            });
    }

    onFormSubmit = async (): Promise<void> => {
        this.resetBoards();
        await this.getBoards();
    }

    onScroll = async (): Promise<void> => {
        this.filter.page++;
        await this.getBoards();
    }

    resetBoards = (): void => {
        this.filter.page = 0;
        this.filter.searchText = '';
        this.boards = [];
    }

    $onDestroy() {
    }
}

export const boardsController = ng.controller('BoardsController',
    ['$scope', 'BoardsService', Controller]);