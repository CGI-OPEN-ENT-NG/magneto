import {IScope} from "angular";
import {angular, ng} from "entcore";
import {InfiniteScrollService} from "../shared/services";

interface IViewModel extends ng.IController, IScrollProps {
    scroll(): Promise<void>;

    loading: boolean;
}

interface IScrollProps {
    scrolled(): void;

    loadingMode: boolean;
    querySelector: string;
    scrollEventer: InfiniteScrollService;
}

interface IScrollScope extends IScope, IScrollProps {
    vm: IViewModel;
}

class Controller implements IViewModel {
    loading: boolean;
    loadingMode: boolean;
    querySelector: string;

    scrollEventer: InfiniteScrollService;

    private currentscrollHeight: number = 0;
    // latest height once scroll will reach
    private latestHeightBottom: number = 300;

    scrolled: () => void;

    constructor(private $scope: IScrollScope) {

    }

    $onInit = () => {
        this.loading = false;
        // If somewhere in your controller you have to reinitialise anything that should "reset" your dom height
        // We reset currentscrollHeight
        this.scrollEventer.getInfiniteScroll().subscribe(() => this.currentscrollHeight = 0);
        if (!!this.querySelector)
            this.latestHeightBottom = 150;
        this.scroll();
    };

    scroll = async (): Promise<void> => {
        let scrollHeight: number;
        let scrollPos: number;

        if (!!this.querySelector) {
            scrollHeight = angular.element(document.querySelector(this.querySelector))[0].scrollHeight as number;
            scrollPos = Math.floor(angular.element(document.querySelector(this.querySelector)).height() + angular.element(document.querySelector(this.querySelector)).scrollTop());
        } else {
            scrollHeight = $(document).height() as number;
            scrollPos = Math.floor($(window).height() + $(window).scrollTop());
        }


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
            querySelector: '=?',
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
                $(document).ready(function () {
                    setScrollEvent(
                        !!vm.querySelector ? $(angular.element(document.querySelector(vm.querySelector))) : $(window)
                    );
                });

             function setScrollEvent (elem: JQuery): void {
                    elem.on("scroll", async () => {
                        await vm.scroll();
                    });
                }
        }
    }
}

export const infiniteScroll = ng.directive('infiniteScroll', directive)