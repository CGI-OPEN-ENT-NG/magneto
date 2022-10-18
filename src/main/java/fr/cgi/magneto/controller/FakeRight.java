package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.*;
import fr.wseduc.rs.*;
import fr.wseduc.security.*;
import io.vertx.core.http.*;
import org.entcore.common.controller.*;

public class FakeRight extends ControllerHelper {
    public FakeRight() {
        super();
    }

    private void notImplemented(HttpServerRequest request) {
        request.response().setStatusCode(501).end();
    }

    @Get("/rights/board/publish")
    @SecuredAction(Rights.PUBLISH_BOARD)
    public void boardPublish(HttpServerRequest request) {
        notImplemented(request);
    }

}
