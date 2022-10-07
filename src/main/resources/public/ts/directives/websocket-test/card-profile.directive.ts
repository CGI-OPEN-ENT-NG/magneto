import {model, ng, toasts} from "entcore";
import {RootsConst} from "../../core/constants/roots.const";
import {ILocationService, IScope, IWindowService} from "angular";
import {EventBusService} from "../../shared/event-bus-service/event-bus-sockjs.service";
declare const window: any;

interface IViewModel extends ng.IController, ICardProfileProps {
    text: string;
    eventBus: EventBusService;

    changeText(newText: string): void;
    getText(): string;

    onClickActionNotify(value: string): void;
    send(address: string, param: any): void;
}

interface ICardProfileProps {
    name: string,
    job: string
}

class Controller implements IViewModel {
    private test: string;

    public text: string;
    public name: string;
    public job: string;
    public eventBus: EventBusService;

    constructor(private $scope: IScope,
                private $location:ILocationService,
                private $window: IWindowService
                /*  inject service etc..just as we do in controller */) {
        this.eventBus = new EventBusService();
    }

    $onInit() {
        let host: string = `${(window.location.protocol)}//${location.hostname}${window.websocketEndpoint}`;
        this.eventBus.connect(host);
        this.eventBus.open.subscribe((res) => {
           console.log("Okay: ", res);

            this.eventBus.registerHandler('collaboration.' + 5, function (error, message) {
                // toasts.info(message);
                console.log("message: ", message);
            });

            this.eventBus.registerHandler('news-feed', function (error, message) {
                // toasts.info(message);
                console.log("messagecc: ", message);
            });
        });

        this.eventBus.close.subscribe((e) => {
            console.log("Nit okay: ", e);
        });
    }

    $onDestroy() {
        console.log("I destroy testDirective");
    }

    changeText(newText: string): void {
    }

    onClickActionNotify(value: string): void {
        console.log("as a parent, im receiving: ", value);
    }

    getText(): string {
        return "";
    }

    send(address: string): void {
        this.eventBus.send(address, {id: 'test123', userId: model.me.userId}, function (reply) {
            console.log("receiving: ", reply);
        });
    }

}

function directive() {
    return {
        restrict: 'E',
        templateUrl: `${RootsConst.directive}websocket-test/card-profile.directive.html`,
        scope: {
            name: "=",
            job: "="
        },
        controllerAs: 'vm',
        bindToController: true,
        controller: ['$scope','$location','$window', Controller],
        /* interaction DOM/element */
        link: function (scope: ng.IScope,
                        element: ng.IAugmentedJQuery,
                        attrs: ng.IAttributes,
                        vm: ng.IController) {
        }
    }
}
export const cardProfile = ng.directive('cardProfile', directive)