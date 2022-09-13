import {IScope} from "angular";
import {ng} from "entcore";
import {InfiniteScrollService} from "../shared/services";

interface IViewModel extends ng.IController, IScrollProps {
    scroll(): Promise<void>;

    loading: boolean;
}

interface IScrollProps {
    scrolled(): void;
    loadingMode: boolean;
    scrollEventer: InfiniteScrollService;
}

interface IScrollScope extends IScope, IScrollProps {
    vm: IViewModel;
}

class Controller implements IViewModel {
    loading: boolean;
    loadingMode: boolean;
    scrollEventer: InfiniteScrollService;

    private currentscrollHeight: number = 0;
    // latest height once scroll will reach
    private latestHeightBottom: number = 300;

    scrolled: () => void;

    constructor(private $scope: IScrollScope) {
    }

    $onInit = () => {
        this.loading = false;
        $(window).on("scroll", async () => {
            await this.scroll();
        });
        // If somewhere in your controller you have to reinitialise anything that should "reset" your dom height
        // We reset currentscrollHeight
        this.scrollEventer.getInfiniteScroll().subscribe(() => this.currentscrollHeight = 0);
        this.scroll();
    };

    scroll = async (): Promise<void> => {
        const scrollHeight: number = $(document).height() as number;
        const scrollPos: number = Math.floor($(window).height() + $(window).scrollTop());
        const isBottom: boolean = scrollHeight - this.latestHeightBottom < scrollPos;

        if (isBottom && this.currentscrollHeight < scrollHeight) {
            if (this.loadingMode) this.loading = true;
            await this.scrolled();
            if (this.loadingMode) this.loading = false;
            // Storing the latest scroll that has been the longest one in order to not redo the scrolled() each time
            this.currentscrollHeight = scrollHeight;
        }
    }

    $onDestroy = () => {
        $(window).off("scroll");
    };

}

function directive() {
    return {
        restrict: 'E',
        template: `
            <div ng-show="vm.loading" style="text-align: center">
              <loader min-height="'50px'"></loader>
            </div>
        `,
        scope: {
            scrolled: '&',
            loadingMode: '=?',
            scrollEventer: '='
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope', Controller],
        /* interaction DOM/element */
        link: function (scope: IScrollScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: ng.IController) {
        }
    }
}

export const infiniteScroll = ng.directive('infiniteScroll', directive)