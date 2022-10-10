package fr.cgi.magneto.service.impl;


import fr.cgi.magneto.core.enums.EventBusActions;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.EventBusHelper;
import fr.cgi.magneto.service.WorkspaceService;
import io.vertx.core.*;
import io.vertx.core.eventbus.*;
import io.vertx.core.json.*;

public class DefaultWorkspaceService implements WorkspaceService {

    private final EventBus eb;


    public DefaultWorkspaceService (Vertx vertx) {
        this.eb = vertx.eventBus();
    }


    @Override
    public Future<JsonObject> getDocument(String documentId) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject action = new JsonObject()
                .put(Field.ACTION, EventBusActions.GETDOCUMENT.action())
                .put(Field.ID, documentId);
        EventBusHelper.requestJsonObject(EventBusActions.EventBusAddresses.WORKSPACE_BUS_ADDRESS.address(), eb, action)
                .onFailure(fail -> {
                    String message = String.format("[Magneto@%s::getDocument] Failed to get document", this.getClass().getSimpleName());
                    promise.fail(message);
                })
                .onSuccess(promise::complete);
        return promise.future();
    }
}