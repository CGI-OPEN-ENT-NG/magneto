import {ng, notify, idiom as lang} from "entcore";
import {IScope} from "angular";
import {IBoardsService, IFoldersService} from "../services";
import {
    IBoardsParamsRequest,
    Boards, Board, BoardForm, Folder, FolderTreeNavItem
} from "../models";
import {safeApply} from "../utils/safe-apply.utils";
import {AxiosError} from "axios";
import {InfiniteScrollService} from "../shared/services";
import {Subject} from "rxjs";
import {FOLDER_TYPE} from "../core/enums/folder-type.enum";

interface IViewModel {
    openedFolder: Folder;
    selectedBoardIds: Array<string>;
    selectedFolderIds: Array<string>;
    selectedUpdateBoardForm: BoardForm;

    displayBoardLightbox: boolean;
    displayDeleteBoardLightbox: boolean;
    displayUpdateBoardLightbox: boolean;
    displayFolderLightbox: boolean;
    displayMoveBoardLightbox: boolean;

    boards: Array<Board>;
    folders: Array<Folder>;
    folderNavTrees: Array<FolderTreeNavItem>;
    folderMoveNavTrees: Array<FolderTreeNavItem>;
    folderNavTreeSubject: Subject<FolderTreeNavItem>;

    filter : {
        page: number,
        isTrash: boolean,
        isPublic: boolean,
        searchText: string
    };

    infiniteScrollService: InfiniteScrollService;

    getBoards(): Promise<void>;
    getFolders(): void;
    getCurrentFolderChildren(): void;
    openCreateForm(): void;
    openDeleteForm(): void;
    openPropertiesForm(): void;
    openBoardOrFolder(): Promise<void>;
    onFormSubmit(): Promise<void>;
    initTrees(): void;
    switchFolder(folder: FolderTreeNavItem): Promise<void>;
    submitFolderForm(): Promise<void>;
    onSearchBoard(searchText: string): Promise<void>;
    onScroll(): void;
    resetBoards(): void;
    restoreBoards(): Promise<void>;
    moveBoards(): Promise<void>;
}

interface IBoardsScope extends IScope {
    vm: IViewModel;
}

class Controller implements ng.IController, IViewModel {


    openedFolder: Folder;
    selectedBoardIds: Array<string>;
    selectedFolderIds: Array<string>;
    selectedUpdateBoardForm: BoardForm;

    displayBoardLightbox: boolean;
    boards: Array<Board>;
    folders: Array<Folder>;
    currentFolderChildren: Array<Folder>;
    folderNavTrees: Array<FolderTreeNavItem>;
    folderMoveNavTrees: Array<FolderTreeNavItem>;
    displayDeleteBoardLightbox: boolean;
    displayUpdateBoardLightbox: boolean;
    displayFolderLightbox: boolean;
    displayMoveBoardLightbox: boolean;

    folderNavTreeSubject: Subject<FolderTreeNavItem>;

    filter : {
        page: number;
        isTrash: boolean;
        isPublic: boolean;
        searchText: string;
    };
    infiniteScrollService: InfiniteScrollService;

    constructor(private $scope: IBoardsScope,
                private boardsService: IBoardsService,
                private foldersService: IFoldersService) {
        this.$scope.vm = this;
        this.infiniteScrollService = new InfiniteScrollService;
        this.folderNavTreeSubject = new Subject<FolderTreeNavItem>();
    }

    async $onInit(): Promise<void> {
        this.openedFolder = null;
        this.displayBoardLightbox = false;
        this.displayDeleteBoardLightbox = false;
        this.displayFolderLightbox = false;
        this.displayMoveBoardLightbox = false;

        this.filter = {
            page: 0,
            isTrash: false,
            isPublic: false,
            searchText: ''
        };
        this.boards = [];
        this.folders = [];
        this.currentFolderChildren = [];
        this.selectedBoardIds = [];
        this.selectedFolderIds = [];
        this.selectedUpdateBoardForm = new BoardForm();
        await Promise.all([this.getBoards(), this.getFolders()]);
    }

    onSearchBoard = async (searchText: string): Promise<void> => {
        this.filter.searchText = searchText;
        this.filter.page = 0;
        this.boards = [];
        await this.getBoards();
    }

    switchFolder = async (folder: FolderTreeNavItem): Promise<void> => {
        this.resetBoards();
        this.openedFolder = new Folder().build({_id: folder.id, title: folder.name,
            parentId: folder.parentId, ownerId: ''});
        this.filter.isTrash = folder.id == FOLDER_TYPE.DELETED_BOARDS;
        this.filter.isPublic = folder.id == FOLDER_TYPE.PUBLIC_BOARDS;

        this.getCurrentFolderChildren();
        await this.getBoards();
    }

    submitFolderForm = async (): Promise<void> => {
        await this.getFolders();
    }

    openCreateForm = (): void => {
        this.displayBoardLightbox = true;
    }

    openDeleteForm = (): void => {
        this.displayDeleteBoardLightbox = true;
    }

    openPropertiesForm = (): void => {
        this.displayUpdateBoardLightbox = true;
        this.displayBoardLightbox = true;
    }

    openBoardOrFolder = async (): Promise<void> => {
        if ((this.selectedBoardIds.length + this.selectedFolderIds.length) !== 1) {
            return;
        }

        if (this.selectedFolderIds.length > 0) {
            this.openedFolder = this.folders.find((folder: Folder) =>
                folder.id == this.selectedFolderIds[0]);
            this.getCurrentFolderChildren();
            this.resetBoards();
            await this.getBoards();

            this.folderNavTreeSubject.next(new FolderTreeNavItem(
                {id: this.openedFolder.id,
                title : this.openedFolder.title, parentId : this.openedFolder.parentId}));
        }
    }

    getBoards = async (): Promise<void> => {
        const params: IBoardsParamsRequest = {
            folderId: this.openedFolder ? this.openedFolder.id : null,
            isPublic: this.filter.isPublic,
            isShared: null,
            isDeleted: this.filter.isTrash,
            searchText: this.filter.searchText,
            sortBy: 'modificationDate',
            page: this.filter.page
        };

        if (params.folderId == FOLDER_TYPE.MY_BOARDS ||
            params.folderId == FOLDER_TYPE.PUBLIC_BOARDS ||
            params.folderId == FOLDER_TYPE.DELETED_BOARDS)
            params.folderId = null;

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

    getFolders = (): void => {
        this.foldersService.getFolders()
            .then((res: Array<Folder>) => {
                this.folders = res;
                this.getCurrentFolderChildren();
                this.initTrees();
                safeApply(this.$scope);
            })
            .catch((err: AxiosError) => {
                notify.error(err.message)
            });
    }

    getCurrentFolderChildren = (): void => {
        this.currentFolderChildren = this.folders.filter((folder: Folder) =>
            folder.parentId == (this.openedFolder ? this.openedFolder.id : null));
    }

    restoreBoards = async (): Promise<void> => {
        await this.boardsService.restorePreDeleteBoards(this.selectedBoardIds);
        this.resetBoards();
        await this.getBoards();
    }

    moveBoards = async (): Promise<void> => {
        this.displayMoveBoardLightbox = true;
    }

    onFormSubmit = async (): Promise<void> => {
        this.resetBoards();
        await this.getBoards();
    }

    initTrees = (): void => {

        this.folders.forEach((folder: Folder) => {
            if (folder.parentId == null) {
                folder.parentId = FOLDER_TYPE.MY_BOARDS;
            }
        });

        this.folderNavTrees = [];
        this.folderMoveNavTrees = [];

        this.folderNavTrees.push(new FolderTreeNavItem(
            {id: FOLDER_TYPE.MY_BOARDS, title: lang.translate('magneto.my.boards'),
                    parentId: null}, "magneto-check-decagram")
            .buildFolders(this.folders));
        this.folderNavTrees.push(new FolderTreeNavItem(
                {id: FOLDER_TYPE.PUBLIC_BOARDS, title: lang.translate('magneto.lycee.connecte.boards'),
                    parentId: null}, "magneto-book-variant-multiple"));
        this.folderNavTrees.push(new FolderTreeNavItem(
            {id: FOLDER_TYPE.DELETED_BOARDS, title: lang.translate('magneto.trash'),
                    parentId: null}, "magneto-delete-forever"));

        // Folder tree for board move lightbox
        this.folderMoveNavTrees.push(new FolderTreeNavItem(
            {id: FOLDER_TYPE.MY_BOARDS, title: lang.translate('magneto.my.boards'),
                parentId: null}, "magneto-check-decagram")
            .buildFolders(this.folders));
        this.folderMoveNavTrees[0].isOpened = true;

        this.folderNavTreeSubject.next(this.folderNavTrees[0]);
    }

    onScroll = async (): Promise<void> => {
        this.filter.page++;
        await this.getBoards();
    }

    resetBoards = (): void => {
        this.filter.page = 0;
        this.filter.searchText = '';
        this.boards = [];
        this.selectedBoardIds = [];
        this.selectedFolderIds = [];
        this.selectedUpdateBoardForm = new BoardForm();
    }

    $onDestroy() {
    }
}

export const boardsController = ng.controller('BoardsController',
    ['$scope', 'BoardsService', 'FoldersService', Controller]);