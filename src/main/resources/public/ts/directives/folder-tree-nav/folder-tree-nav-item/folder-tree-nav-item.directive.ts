import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {FolderTreeNavItem} from "../../../models";
import {RootsConst} from "../../../core/constants/roots.const";
import {Subject} from "rxjs";
import {Draggable} from "../../../models/draggable.model";

interface IViewModel extends ng.IController, IFolderTreeNavItemProps {
    /**
     * Open/close folder
     * @param $event click event
     */
    toggleOpenFolder($event: JQueryMouseEventObject): void;

    /**
     * Is folder selected
     */
    isSelected(): boolean;

    /**
     * Select folder
     * @param folder folder to select
     */
    selectFolder?(folder: FolderTreeNavItem): void;
}

interface IFolderTreeNavItemProps {
    folderTree: FolderTreeNavItem;
    onSelectFolder?;
    selectedFolder: FolderTreeNavItem;
    openFolderEventer: Subject<string>;
    drag?: Draggable;

}

interface IFolderTreeNavItemScope extends IScope, IFolderTreeNavItemProps {
    vm: IViewModel;
}

class Controller implements IViewModel {
    folderTree: FolderTreeNavItem;
    selectedFolder: FolderTreeNavItem;
    openFolderEventer: Subject<string>;
    drag?: Draggable;


    constructor(private $scope: IFolderTreeNavItemScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit(): void {
    }

    isSelected = (): boolean => {
        return this.selectedFolder && this.folderTree &&
            (this.selectedFolder.id === this.folderTree.id);
    }

    toggleOpenFolder($event: JQueryMouseEventObject): void {
        this.folderTree.isOpened = !this.folderTree.isOpened;
        $event.stopPropagation();
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}/folder-tree-nav/folder-tree-nav-item/folder-tree-nav-item.html`,
        scope: {
            folderTree: '=',
            onSelectFolder: '&',
            selectedFolder: '=',
            openFolderEventer: '=',
            drag: '=?'
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IFolderTreeNavItemScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.selectFolder = (folder: FolderTreeNavItem): void => {
                vm.selectedFolderId = folder.id;
                $parse($scope.vm.onSelectFolder())(folder);
            }
        }
    }
}

export const folderTreeNavItem = ng.directive('folderTreeNavItem', directive)