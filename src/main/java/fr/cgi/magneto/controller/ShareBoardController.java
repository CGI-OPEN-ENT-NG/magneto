package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.security.*;
import fr.wseduc.rs.*;
import fr.wseduc.security.*;
import fr.wseduc.webutils.*;
import io.vertx.core.http.*;
import io.vertx.core.json.*;
import org.entcore.common.controller.*;
import org.entcore.common.http.filter.*;
import org.entcore.common.user.*;

public class ShareBoardController extends ControllerHelper {
    public ShareBoardController() {
    }

    // Init sharing rights
    @SecuredAction(value = Rights.READ, type = ActionType.RESOURCE)
    public void initReadRight(final HttpServerRequest request) {
    }

    @SecuredAction(value = Rights.CONTRIB, type = ActionType.RESOURCE)
    public void initContribRight(final HttpServerRequest request) {
    }

    @SecuredAction(value = Rights.MANAGER, type = ActionType.RESOURCE)
    public void initManagerRight(final HttpServerRequest request) {
    }

    @SecuredAction(value = Rights.PUBLISH, type = ActionType.RESOURCE)
    public void initPublishRight(final HttpServerRequest request) {
    }

    @Get("/share/json/:id")
    @ApiDoc("Share board by id")
    @ResourceFilter(GetSharesRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void shareBoard(final HttpServerRequest request) {
        shareJson(request, false);
    }

    @Put("/share/resource/:id")
    @ApiDoc("Share board by id")
    @ResourceFilter(GetSharesRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void shareResource(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            if (user != null) {
                final String id = request.params().get(Field.ID);
                if (id == null || id.trim().isEmpty()) {
                    badRequest(request, "invalid.id");
                    return;
                }

                JsonObject params = new JsonObject();
                params.put(Field.PROFILURI, "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
                params.put(Field.USERNAME, user.getUsername());

                JsonObject pushNotif = new JsonObject()
                        .put(Field.TITLE, "push.notif.magneto.share")
                        .put(Field.BODY, user.getUsername() + " " + I18n.getInstance().translate("magneto.shared.push.notif.body",
                                getHost(request), I18n.acceptLanguage(request)));

                params.put(Field.PUSHNOTIF, pushNotif);

                shareResource(request, "magneto.share", false, params, Field.TITLE);
            }
        });
    }



}
