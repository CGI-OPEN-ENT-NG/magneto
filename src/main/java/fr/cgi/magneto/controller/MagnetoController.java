package fr.cgi.magneto.controller;

import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;

public class MagnetoController extends ControllerHelper {

    private final EventStore eventStore;

    public MagnetoController(ServiceFactory serviceFactory) {
        this.eventStore = EventStoreFactory.getFactory().getEventStore(Magneto.class.getSimpleName());
    }

    @Get("")
    @ApiDoc("Render view")
    @SecuredAction(Rights.VIEW)
    public void view(HttpServerRequest request) {
        renderView(request);
        eventStore.createAndStoreEvent("ACCESS", request);
    }
}
