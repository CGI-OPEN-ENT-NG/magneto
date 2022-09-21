import {ng} from "entcore";
import {ILocationService, IParseService, IScope, IWindowService} from "angular";
import {RootsConst} from "../../core/constants/roots.const";
import {FolderTreeNavItem} from "../../models";
import {Subject} from "rxjs";

interface IViewModel extends ng.IController, IFolderTreeNavProps {
    /**
     * Select folder
     * @param folder folder to select
     */
    selectFolder?(folder: FolderTreeNavItem): void;

    /**
     * Selected folder
     */
    selectedFolder: FolderTreeNavItem;
}

interface IFolderTreeNavProps {
    /**
     * Object containing the folder tree
     */
    folderTrees: Array<FolderTreeNavItem>;

    /**
     * Subject to receive signal when a folder is selected
     */
    folderTreeEventer: Subject<FolderTreeNavItem>;

    /**
     * Callback when a folder is selected
     */
    onSelectFolder?;
}

interface IFolderTreeNavScope extends IScope, IFolderTreeNavProps {
    vm: IViewModel;
}

class Controller implements IViewModel {
    folderTrees: Array<FolderTreeNavItem>;
    selectedFolder: FolderTreeNavItem;
    folderTreeEventer: Subject<FolderTreeNavItem>;

    constructor(private $scope: IFolderTreeNavScope,
                private $location: ILocationService,
                private $window: IWindowService) {
    }

    $onInit(): void {
        // On folder selected, update selected folder and open all its parent folders
        if (this.folderTreeEventer) {
            this.folderTreeEventer.asObservable().subscribe((folder: FolderTreeNavItem) => {
                this.selectedFolder = folder;
                if (this.folderTrees) {
                    this.folderTrees.forEach((folderTree: FolderTreeNavItem) => {
                        folderTree.openChildrenToId(folder.id);
                    });
                }
            });
        }
    }

    $onDestroy() {
    }

}

function directive($parse: IParseService) {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}/folder-tree-nav/folder-tree-nav.html`,
        scope: {
            folderTrees: '=',
            onSelectFolder: '&',
            folderTreeEventer: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', '$location', '$window', '$parse', Controller],
        /* interaction DOM/element */
        link: function ($scope: IFolderTreeNavScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: IViewModel) {

            vm.selectFolder = (folder: FolderTreeNavItem): void => {
                vm.selectedFolder = folder;
                $parse($scope.vm.onSelectFolder())(folder);
            }
        }
    }
}

export const folderTreeNav = ng.directive('folderTreeNav', directive);